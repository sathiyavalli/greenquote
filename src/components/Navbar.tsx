'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!adminDropdownOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [adminDropdownOpen]);

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 print-hidden relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center font-bold text-white group-hover:shadow-lg transition-shadow">
              GQ
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:inline">GreenQuote</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : user ? (
              <>
                <div className="hidden md:flex items-center gap-4">
                  {user.role !== 'admin' && (
                    <>
                      <Link
                        href="/quotes"
                        className={`text-sm font-medium transition-colors ${
                          pathname.startsWith('/quotes') && !pathname.includes('/create')
                            ? 'text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        My Quotes
                      </Link>
                      <Link
                        href="/quotes/create"
                        className={`text-sm font-medium transition-colors ${
                          pathname === '/quotes/create'
                            ? 'text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        New Quote
                      </Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <div className="flex items-center gap-4">
                      <Link
                        href="/admin"
                        className={`text-sm font-medium transition-colors ${
                          pathname === '/admin'
                            ? 'text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                         Dashboard
                      </Link>
                      <Link
                        href="/admin/quotes/create"
                        className={`text-sm font-medium transition-colors ${
                          pathname === '/admin/quotes/create'
                            ? 'text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Create Quote
                      </Link>
                      <Link
                        href="/admin/users"
                        className={`text-sm font-medium transition-colors ${
                          pathname.startsWith('/admin/users')
                            ? 'text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Users
                      </Link>
                      <Link
                        href="/admin/quotes"
                        className={`text-sm font-medium transition-colors ${
                          pathname.startsWith('/admin/quotes')
                            ? 'text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Quotes
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 px-3 py-2 hover:bg-gray-50 text-sm font-medium"
                  aria-label="Toggle top navigation menu"
                >
                  {mobileMenuOpen ? 'Close Menu' : 'Menu'}
                </button>

                {/* User Dropdown */}
                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-transparent border border-red-600 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {!isLoading && user && mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-2">
            <Link
              href="/quotes"
              className={`block px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith('/quotes') && !pathname.includes('/create')
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              My Quotes
            </Link>

            {user.role !== 'admin' && (
              <Link
                href="/quotes/create"
                className={`block px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/quotes/create'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                New Quote
              </Link>
            )}

            {user.role === 'admin' && (
              <>
                <Link
                  href="/admin"
                  className={`block px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/admin'
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/quotes/create"
                  className={`block px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/admin/quotes/create'
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Create Quote
                </Link>
                <Link
                  href="/admin/users"
                  className={`block px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith('/admin/users')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/admin/quotes"
                  className={`block px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith('/admin/quotes')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Quotes
                </Link>
              </>
            )}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-xs text-gray-500 mb-2">{user.email}</p>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 bg-transparent border border-red-600 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
