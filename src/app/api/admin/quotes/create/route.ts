import { NextRequest } from 'next/server';
import { quoteService } from '@/services/quoteService';
import { quoteInputSchema } from '@/utils/validation';
import { verifyAdmin } from '@/middleware/auth';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const POST = withApiErrorHandler(async (request: NextRequest) => {
  const startTime = logRequestStart(request);
  const payload = verifyAdmin(request);
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
}, { operation: 'POST /api/admin/quotes/create' });
