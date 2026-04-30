import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/services/quoteService';
import { verifyTokenFromRequest } from '@/lib/jwt';
import { AppError, AuthorizationError } from '@/utils/errors';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyTokenFromRequest(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let quotes;

    if (email) {
      // Search by email
      quotes = await quoteService.searchQuotesByEmail(email);
    } else {
      // Get all quotes with pagination
      quotes = await quoteService.getAllQuotes(limit, offset);
    }

    return NextResponse.json(
      {
        quotes,
        count: quotes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin quotes endpoint error:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
