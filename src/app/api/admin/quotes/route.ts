import { NextRequest } from 'next/server';
import { quoteService } from '@/services/quoteService';
import { verifyAdmin } from '@/middleware/auth';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const GET = withApiErrorHandler(async (request: NextRequest) => {
  const startTime = logRequestStart(request);
  verifyAdmin(request);

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 1000);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const quotes = email
    ? await quoteService.searchQuotesByEmail(email)
    : await quoteService.getAllQuotes(limit, offset);

  const response = apiSuccess({ quotes, count: quotes.length });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'GET /api/admin/quotes' });
