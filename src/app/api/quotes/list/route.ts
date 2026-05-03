import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthentication } from '@/middleware/auth';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const GET = withApiErrorHandler(async (request: NextRequest) => {
  const startTime = logRequestStart(request);
  const payload = verifyAuthentication(request);

  const quotes = await prisma.quote.findMany({
    where: { userId: payload.userId },
    include: {
      offers: {
        orderBy: { termYears: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const response = apiSuccess(quotes);
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'GET /api/quotes/list' });
