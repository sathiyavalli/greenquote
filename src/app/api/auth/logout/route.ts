import { NextRequest } from 'next/server';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const POST = withApiErrorHandler(async (req: NextRequest) => {
  const startTime = logRequestStart(req);
  const response = apiSuccess({ message: 'Logged out successfully' }, 200);
  logRequestEnd(req, startTime, 200);

  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}, { operation: 'POST /api/auth/logout' });
