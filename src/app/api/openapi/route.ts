import { NextRequest, NextResponse } from 'next/server';
import { openApiSpec } from '@/lib/openapi';
import { withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const GET = withApiErrorHandler(async (request: NextRequest) => {
  const startTime = logRequestStart(request);
  const response = NextResponse.json(openApiSpec, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'GET /api/openapi' });
