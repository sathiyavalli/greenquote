'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/quotes');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-[calc(100vh-4rem)] flex-col fixed left-0 top-16 print-hidden">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <Link href="/admin" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center font-bold text-gray-900 group-hover:bg-green-400 transition-colors">
            GQ
          </div>
          <span className="font-bold text-lg">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-3">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/quotes/manage')
              ? 'bg-green-500 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          <span className="text-xl">📊</span>
          <span>Dashboard</span>
        </Link>

        <Link
          href="/admin/users"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive('/admin/users')
              ? 'bg-green-500 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          <span className="text-xl">👥</span>
          <span>Users</span>
        </Link>

        <Link
          href="/admin/quotes"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive('/admin/quotes')
              ? 'bg-green-500 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          <span className="text-xl">📋</span>
          <span>Quotes</span>
        </Link>
      </nav>

      {/* User Info & Logout */}
      <div className="p-6 border-t border-gray-700 space-y-3">
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="font-semibold text-sm truncate">{user.email}</p>
          <p className="text-xs text-green-400 font-medium">Admin</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
