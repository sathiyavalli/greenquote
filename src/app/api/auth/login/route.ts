import { NextRequest } from 'next/server';
import { authService } from '@/services/authService';
import { loginSchema } from '@/utils/validation';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logger } from '@/utils/logger';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const POST = withApiErrorHandler(async (req: NextRequest) => {
  const startTime = logRequestStart(req);
  const body = await req.json();
  const input = loginSchema.parse(body);

  const result = await authService.login(input);
  logger.info('User logged in', { email: input.email });

  const response = apiSuccess(result, 200);

  response.cookies.set('auth-token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  logRequestEnd(req, startTime, response.status);
  return response;
}, { operation: 'POST /api/auth/login' });
