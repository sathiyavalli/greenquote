import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Protect /quotes and /admin routes
  if (request.nextUrl.pathname.startsWith('/quotes') || request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check admin access
    if (request.nextUrl.pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/quotes', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/quotes/:path*', '/admin/:path*'],
};
