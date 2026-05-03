import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthentication } from '@/middleware/auth';
import { AuthorizationError, NotFoundError } from '@/utils/errors';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const DELETE = withApiErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const startTime = logRequestStart(request);
  const payload = verifyAuthentication(request);

  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
  });

  if (!quote) {
    throw new NotFoundError('Quote not found');
  }

  if (payload.role !== 'admin' && quote.userId !== payload.userId) {
    throw new AuthorizationError('You do not have permission to delete this quote');
  }

  await prisma.quote.delete({
    where: { id: params.id },
  });

  const response = apiSuccess({ message: 'Quote deleted successfully' });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'DELETE /api/quotes/:id/delete' });
