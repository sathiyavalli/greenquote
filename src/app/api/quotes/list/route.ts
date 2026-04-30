import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { AuthenticationError } from '@/utils/errors';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      throw new AuthenticationError('Invalid or expired token');
    }
    
    const userId = payload.userId;

    // Fetch user's quotes with offers
    const quotes = await prisma.quote.findMany({
      where: { userId },
      include: {
        offers: {
          orderBy: { termYears: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: quotes,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: 'AUTHENTICATION_ERROR',
          },
        },
        { status: 401 }
      );
    }

    console.error('GET /api/quotes error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
