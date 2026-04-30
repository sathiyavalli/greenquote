import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/services/quoteService';
import { quoteInputSchema } from '@/utils/validation';
import { verifyAuthentication } from '@/middleware/auth';
import { ValidationError, AppError } from '@/utils/errors';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = verifyAuthentication(request);
    const userId = payload.userId;

    // Fetch user's quotes
    const quotes = await quoteService.getUserQuotes(userId);

    return NextResponse.json(
      {
        success: true,
        data: quotes,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      const statusCode =
        error.name === 'AuthenticationError'
          ? 401
          : error.name === 'AuthorizationError'
            ? 403
            : 400;
      return NextResponse.json(
        {
          success: false,
          error: error.name,
          message: error.message,
        },
        { status: statusCode }
      );
    }

    console.error('Unexpected error in GET /api/quotes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = verifyAuthentication(request);
    const userId = payload.userId;

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedInput = quoteInputSchema.parse(body);

    // Create quote
    const quote = await quoteService.createQuote(userId, {
      fullName: validatedInput.fullName,
      address: validatedInput.address,
      monthlyConsumptionKwh: validatedInput.monthlyConsumptionKwh,
      systemSizeKw: validatedInput.systemSizeKw,
      downPayment: validatedInput.downPayment,
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: error.message,
        },
        { status: 400 }
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

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    // Log unexpected errors
    console.error('Unexpected error in POST /api/quotes:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
