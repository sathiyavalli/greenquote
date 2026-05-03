import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

type SuccessOptions = {
  includeDataFields?: boolean;
};

type ErrorBody = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

function timestamp() {
  return new Date().toISOString();
}

export function apiSuccess<T>(
  data: T,
  status = 200,
  options?: SuccessOptions
) {
  const body: Record<string, unknown> = {
    success: true,
    data,
    timestamp: timestamp(),
  };

  if (
    options?.includeDataFields &&
    data !== null &&
    typeof data === 'object' &&
    !Array.isArray(data)
  ) {
    Object.assign(body, data as Record<string, unknown>);
  }

  return NextResponse.json(body, { status });
}

export function apiError(error: ErrorBody) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      message: error.message,
      timestamp: timestamp(),
    },
    { status: error.status }
  );
}

export function mapApiError(error: unknown): ErrorBody {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      code: error.code || error.name.toUpperCase(),
      message: error.message,
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: error.errors[0]?.message || 'Validation failed',
      details: error.errors,
    };
  }

  if (error instanceof SyntaxError) {
    return {
      status: 400,
      code: 'INVALID_JSON',
      message: 'Request body must be valid JSON',
    };
  }

  return {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  };
}

type RouteHandler<TContext = { params?: Record<string, string> }> = (
  request: NextRequest,
  context: TContext
) => Promise<NextResponse> | NextResponse;

type HandlerOptions = {
  operation: string;
};

export function withApiErrorHandler<TContext = { params?: Record<string, string> }>(
  handler: RouteHandler<TContext>,
  options: HandlerOptions
) {
  return async (request: NextRequest, context: TContext) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const mapped = mapApiError(error);

      if (mapped.status >= 500) {
        logger.error(`Unexpected error in ${options.operation}`, error);
      } else {
        logger.warn(`Handled error in ${options.operation}`, {
          code: mapped.code,
          message: mapped.message,
          status: mapped.status,
        });
      }

      return apiError(mapped);
    }
  };
}