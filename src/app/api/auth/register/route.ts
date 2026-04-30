import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/authService';
import { registerSchema } from '@/utils/validation';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = registerSchema.parse(body);

    const result = await authService.register(input);

    logger.info('User registered', { email: input.email });

    return NextResponse.json(
      { success: true, data: result, timestamp: new Date().toISOString() },
      { status: 201 }
    );
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
    logger.error('Register error', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Registration failed' }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
