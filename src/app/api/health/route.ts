import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRequestLogging } from '@/lib/logging-middleware';
import { logger } from '@/utils/logger';
import { AppError } from '@/utils/errors';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';

const healthGet = withApiErrorHandler(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    logger.error('Health check database error', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(503, 'Database connection failed', 'SERVICE_UNAVAILABLE');
  }

  logger.info('Health check passed');

  return apiSuccess(
    {
      status: 'healthy',
      environment: process.env.NODE_ENV,
    },
    200,
    { includeDataFields: true }
  );
}, { operation: 'GET /api/health' });

export const GET = async (request: NextRequest) => {
  return withRequestLogging(request, async () => healthGet(request, undefined as any));
};
