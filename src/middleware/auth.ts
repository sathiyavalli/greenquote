import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AuthenticationError, AuthorizationError } from '@/utils/errors';

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

export function verifyAuthentication(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new AuthenticationError('Missing authentication token');
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new AuthenticationError('Invalid or expired token');
  }

  return payload;
}

export function verifyAuthorization(role: string | string[], userRole: string) {
  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(userRole)) {
    throw new AuthorizationError('Insufficient permissions');
  }
}

export function verifyAdmin(request: NextRequest) {
  const payload = verifyAuthentication(request);
  verifyAuthorization('admin', payload.role || 'user');
  return payload;
}
