import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const PUT = withApiErrorHandler(async (
  request: NextRequest,
  { params }: { params: { userId: string } }
) => {
  const startTime = logRequestStart(request);
  const adminPayload = verifyAdmin(request);

  if (adminPayload.userId === params.userId) {
    throw new ValidationError('Cannot modify your own role');
  }

  const body = await request.json();
  const { role } = body;

  if (!role || !['user', 'admin'].includes(role)) {
    throw new ValidationError('Invalid role. Must be "user" or "admin".');
  }

  let updatedUser;
  try {
    updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      throw new NotFoundError('User not found');
    }
    throw error;
  }

  const response = apiSuccess({ user: updatedUser });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'PUT /api/admin/users/:userId' });
