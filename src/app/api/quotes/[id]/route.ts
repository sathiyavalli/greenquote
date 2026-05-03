import { NextRequest } from 'next/server';
import { quoteService } from '@/services/quoteService';
import { verifyAuthentication } from '@/middleware/auth';
import { AuthorizationError, NotFoundError, ValidationError } from '@/utils/errors';
import { prisma } from '@/lib/prisma';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const GET = withApiErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const startTime = logRequestStart(request);
  const payload = verifyAuthentication(request);
  const userId = payload.userId;
  const userRole = payload.role || 'user';
  const quoteId = params.id;

  if (!quoteId) {
    throw new ValidationError('Quote ID is required');
  }

  let quote;
  try {
    quote = await quoteService.getQuote(quoteId);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new NotFoundError(error.message);
    }
    throw error;
  }

  if (userRole !== 'admin' && quote.userId !== userId) {
    throw new AuthorizationError('You are not authorized to access this quote');
  }

  const response = apiSuccess(quote, 200, { includeDataFields: true });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'GET /api/quotes/:id' });

// DELETE quote
export const DELETE = withApiErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const startTime = logRequestStart(request);
  const payload = verifyAuthentication(request);
  const userId = payload.userId;
  const userRole = payload.role || 'user';

  const quoteId = params.id;
  if (!quoteId) {
    throw new ValidationError('Quote ID is required');
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    throw new NotFoundError('Quote not found');
  }

  if (userRole !== 'admin' && quote.userId !== userId) {
    throw new AuthorizationError('Forbidden');
  }

  await prisma.quote.delete({
    where: { id: quoteId },
  });

  const response = apiSuccess({ message: 'Quote deleted successfully' });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'DELETE /api/quotes/:id' });

// PUT - Update quote status (admin only)
export const PUT = withApiErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const startTime = logRequestStart(request);
  const payload = verifyAuthentication(request);
  const userRole = payload.role || 'user';

  const quoteId = params.id;
  if (!quoteId) {
    throw new ValidationError('Quote ID is required');
  }

  if (userRole !== 'admin') {
    throw new AuthorizationError('Only admins can update quote status');
  }

  const body = await request.json();
  const { status } = body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    throw new ValidationError('Invalid status. Must be pending, approved, or rejected.');
  }

  await prisma.quote.update({
    where: { id: quoteId },
    data: { status },
  });

  const updatedQuote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { offers: true, user: true },
  });

  if (!updatedQuote) {
    throw new NotFoundError('Quote not found');
  }

  const response = apiSuccess({
    quote: {
      id: updatedQuote.id,
      userId: updatedQuote.userId,
      fullName: updatedQuote.fullName,
      email: updatedQuote.user?.email || 'N/A',
      address: updatedQuote.address,
      monthlyConsumptionKwh: updatedQuote.monthlyConsumptionKwh,
      systemSizeKw: updatedQuote.systemSizeKw,
      downPayment: updatedQuote.downPayment ?? 0,
      systemPrice: updatedQuote.systemPrice,
      principalAmount: updatedQuote.principalAmount,
      riskBand: updatedQuote.riskBand,
      status: updatedQuote.status,
      offers: updatedQuote.offers.map((offer) => ({
        id: offer.id,
        termYears: offer.termYears,
        apr: offer.apr,
        monthlyPayment: offer.monthlyPayment,
      })),
      createdAt: updatedQuote.createdAt,
      updatedAt: updatedQuote.updatedAt,
    },
  });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'PUT /api/quotes/:id' });
