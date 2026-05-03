import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const GET = withApiErrorHandler(async (request: NextRequest) => {
  const startTime = logRequestStart(request);
  verifyAdmin(request);

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const role = searchParams.get('role');
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const where: any = {};
  if (email) {
    where.email = {
      contains: email,
      mode: 'insensitive',
    };
  }
  if (role) {
    where.role = role;
  }

  const totalCount = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      _count: {
        select: { quotes: true },
      },
    },
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });

  const response = apiSuccess({
    users: users.map((u) => ({
      ...u,
      quoteCount: u._count.quotes,
    })),
    totalCount,
    pageSize: limit,
    offset,
  });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'GET /api/admin/users' });
