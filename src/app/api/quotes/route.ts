import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/services/quoteService';
import { quoteInputSchema } from '@/utils/validation';
import { verifyAuthentication } from '@/middleware/auth';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const GET = withApiErrorHandler(async (request: NextRequest) => {
  const startTime = logRequestStart(request);
  const payload = verifyAuthentication(request);
  const quotes = await quoteService.getUserQuotes(payload.userId);

  const response = apiSuccess(quotes);
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'GET /api/quotes' });

export const POST = withApiErrorHandler(async (request: NextRequest) => {
  const startTime = logRequestStart(request);
  const payload = verifyAuthentication(request);
  const body = await request.json();
  const validatedInput = quoteInputSchema.parse(body);

  const quote = await quoteService.createQuote(payload.userId, {
    fullName: validatedInput.fullName,
    address: validatedInput.address,
    monthlyConsumptionKwh: validatedInput.monthlyConsumptionKwh,
    systemSizeKw: validatedInput.systemSizeKw,
    downPayment: validatedInput.downPayment,
  });

  const response = apiSuccess(quote, 201, { includeDataFields: true });
  logRequestEnd(request, startTime, 201);
  return response;
}, { operation: 'POST /api/quotes' });
