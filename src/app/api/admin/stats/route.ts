import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const GET = withApiErrorHandler(async (request: NextRequest) => {
  const startTime = logRequestStart(request);
  verifyAdmin(request);

  const totalUsers = await prisma.user.count();
  const adminCount = await prisma.user.count({
    where: { role: 'admin' },
  });
  const totalQuotes = await prisma.quote.count();

  const quotes = await prisma.quote.findMany({
    select: { systemPrice: true },
  });
  const totalSystemPrice = quotes.reduce((sum, q) => sum + q.systemPrice, 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const quotesThisMonth = await prisma.quote.count({
    where: {
      createdAt: {
        gte: thisMonth,
      },
    },
  });

  const response = apiSuccess({
    stats: {
      totalUsers,
      adminCount,
      totalQuotes,
      quotesThisMonth,
      totalSystemPrice,
      averageSystemPrice: totalQuotes > 0 ? totalSystemPrice / totalQuotes : 0,
    },
  });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'GET /api/admin/stats' });
