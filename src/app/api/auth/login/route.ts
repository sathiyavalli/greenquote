import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/authService';
import { loginSchema } from '@/utils/validation';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = loginSchema.parse(body);

    const result = await authService.login(input);

    logger.info('User logged in', { email: input.email });

    const response = NextResponse.json(
      { success: true, data: result, timestamp: new Date().toISOString() },
      { status: 200 }
    );

    // Set HTTP-only cookie as well for SSR protection
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message }, timestamp: new Date().toISOString() },
        { status: error.statusCode }
      );
    }
    if ((error as any)?.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: (error as any).errors[0].message }, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }
    logger.error('Login error', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Login failed' }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
