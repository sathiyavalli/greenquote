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
      { 
        success: true, 
        data: result, 
        timestamp: new Date().toISOString() 
      },
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
    console.error('Login error:', error);
    
    if (error instanceof AppError) {
      logger.error('AppError during login', { 
        code: error.code, 
        message: error.message,
        statusCode: error.statusCode
      });
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: error.code || 'ERROR', 
            message: error.message 
          }, 
          timestamp: new Date().toISOString()
        },
        { status: error.statusCode }
      );
    }

    if ((error as any)?.name === 'ZodError') {
      const zodErrors = (error as any).errors;
      logger.error('Validation error during login', { errors: zodErrors });
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: zodErrors[0]?.message || 'Validation failed' 
          }, 
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    logger.error('Unexpected error during login', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'An unexpected error occurred during login' 
        }, 
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
