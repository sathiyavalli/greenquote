import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true, data: { message: 'Logged out successfully' }, timestamp: new Date().toISOString() },
    { status: 200 }
  );

  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
