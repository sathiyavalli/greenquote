import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

/**
 * Middleware wrapper for logging API request/response metrics
 * Logs: method, path, status code, duration, and timestamp
 * 
 * Usage in API routes:
 *   const response = await withRequestLogging(
 *     request,
 *     async () => NextResponse.json({ ... }, { status: 200 })
 *   );
 */
export async function withRequestLogging(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const method = request.method;
  const path = new URL(request.url).pathname;

  try {
    const response = await handler();
    const duration = Date.now() - startTime;

    // Log successful request
    logger.info('API request completed', {
      method,
      path,
      status: response.status,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failed request
    logger.error('API request failed', {
      method,
      path,
      duration_ms: duration,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    // Return error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Alternative middleware for measuring request duration without full wrapping
 * Logs timing information for any endpoint
 * 
 * Usage:
 *   const startTime = logRequestStart(request);
 *   // ... handle request ...
 *   logRequestEnd(request, startTime, response.status);
 */
export function logRequestStart(request: NextRequest): number {
  const method = request.method;
  const path = new URL(request.url).pathname;

  logger.debug('API request started', {
    method,
    path,
    timestamp: new Date().toISOString(),
  });

  return Date.now();
}

export function logRequestEnd(
  request: NextRequest,
  startTime: number,
  statusCode: number
): void {
  const duration = Date.now() - startTime;
  const method = request.method;
  const path = new URL(request.url).pathname;

  const logLevel = statusCode >= 400 ? 'warn' : 'info';

  logger[logLevel as 'warn' | 'info']('API request completed', {
    method,
    path,
    status: statusCode,
    duration_ms: duration,
    timestamp: new Date().toISOString(),
  });
}
