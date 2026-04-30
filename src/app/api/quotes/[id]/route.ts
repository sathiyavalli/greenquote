import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/services/quoteService';
import { verifyAuthentication } from '@/middleware/auth';
import { ValidationError, AuthenticationError, AppError } from '@/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const payload = verifyAuthentication(request);
    const userId = payload.userId;
    const userRole = payload.role || 'user';

    // Get quote ID from params
    const quoteId = params.id;

    if (!quoteId) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Quote ID is required',
        },
        { status: 400 }
      );
    }

    // Fetch quote
    // If user is not admin, enforce ownership
    let quote;
    if (userRole === 'admin') {
      quote = await quoteService.getQuote(quoteId);
    } else {
      quote = await quoteService.getQuote(quoteId, userId);
    }

    return NextResponse.json(quote, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: error.message,
        },
        { status: 404 }
      );
    }

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: error.message,
        },
        { status: 401 }
      );
    }

    if (error instanceof AppError) {
      const statusCode =
        error.name === 'AuthenticationError'
          ? 401
          : error.name === 'AuthorizationError'
            ? 403
            : 400;
      return NextResponse.json(
        {
          error: error.name,
          message: error.message,
        },
        { status: statusCode }
      );
    }

    // Log unexpected errors
    console.error('Unexpected error in GET /api/quotes/:id:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
