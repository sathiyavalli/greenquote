import { NextRequest } from 'next/server';
import { authService } from '@/services/authService';
import { registerSchema } from '@/utils/validation';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logger } from '@/utils/logger';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const POST = withApiErrorHandler(async (req: NextRequest) => {
  const startTime = logRequestStart(req);
  const body = await req.json();
  const input = registerSchema.parse(body);

  const result = await authService.register(input);

  logger.info('User registered', { email: input.email });

  const response = apiSuccess(result, 201);
  logRequestEnd(req, startTime, 201);

  response.cookies.set('auth-token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return response;
}, { operation: 'POST /api/auth/register' });
