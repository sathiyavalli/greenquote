'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function QuotesPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">GreenQuote</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, <strong>{user.fullName}</strong></span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">My Quotes</h2>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-6">No quotes yet. Get started by creating your first solar financing quote!</p>
          <button
            onClick={() => router.push('/quotes/create')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
          >
            Get Your First Quote
          </button>
        </div>

        {/* Debug info for Phase 1 testing */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">👤 Logged In User</h3>
          <pre className="text-xs bg-white p-4 rounded overflow-auto text-gray-700">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}
