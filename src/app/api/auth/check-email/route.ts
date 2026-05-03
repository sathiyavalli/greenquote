import { NextRequest } from 'next/server';
import { userRepository } from '@/repositories/userRepository';
import { ValidationError } from '@/utils/errors';
import { apiSuccess, withApiErrorHandler } from '@/lib/api';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';

export const POST = withApiErrorHandler(async (request: NextRequest) => {
  const startTime = logRequestStart(request);
  const { email } = await request.json();

  if (!email) {
    throw new ValidationError('Email is required');
  }

  const exists = await userRepository.existsByEmail(email);

  const response = apiSuccess({
    exists,
    message: exists ? 'Email already exists' : 'Email is available',
  });
  logRequestEnd(request, startTime, 200);
  return response;
}, { operation: 'POST /api/auth/check-email' });
