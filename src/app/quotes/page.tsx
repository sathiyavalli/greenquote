'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Quote {
  id: string;
  fullName: string;
  email: string;
  systemSizeKw: number;
  systemPrice: number;
  riskBand: 'A' | 'B' | 'C';
  createdAt: string;
}

export default function QuotesPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('QuotesPage useEffect - isLoading:', isLoading, 'token:', !!token, 'user:', user?.email);
    
    if (!isLoading && !token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return;
    }

    if (token && !isLoading) {
      console.log('Token found, fetching quotes for user:', user?.email);
      fetchQuotes();
    }
  }, [token, isLoading, router, user]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }

      const json = await response.json();
      setQuotes(json.data || []);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const hasQuotes = quotes.length > 0;
  const riskBandColors: Record<string, string> = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-yellow-100 text-yellow-800',
    C: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">GreenQuote</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, <strong>{user.fullName}</strong>
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Solar Quotes</h2>
          <button
            onClick={() => router.push('/quotes/create')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            ➕ Request New Quote
          </button>
        </div>

        {/* Empty State */}
        {!hasQuotes && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">☀️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Quotes Yet</h3>
              <p className="text-gray-600 text-lg">
                Get started by requesting your first solar financing pre-qualification quote.
              </p>
            </div>
            <button
              onClick={() => router.push('/quotes/create')}
              className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Get Your First Quote
            </button>
          </div>
        )}

        {/* Quotes Table */}
        {hasQuotes && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Band
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(quote.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote.systemSizeKw} kW
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${quote.systemPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskBandColors[quote.riskBand]}`}>
                          Band {quote.riskBand}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => router.push(`/quotes/${quote.id}`)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Loading your quotes...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
