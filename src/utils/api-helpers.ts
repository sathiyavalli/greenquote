import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { AppError, ValidationError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

export async function handleApiError(
  error: unknown,
  res?: NextApiResponse
): Promise<ApiResponse> {
  logger.error('API Error', error);

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.errors[0].message,
      },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    timestamp: new Date().toISOString(),
  };
}

export function success<T>(data: T, statusCode = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}
