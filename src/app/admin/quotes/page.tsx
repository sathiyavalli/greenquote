'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Quote {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  systemPrice: number;
  riskBand: 'A' | 'B' | 'C';
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  };
}

export default function AdminQuotesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [filterBand, setFilterBand] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');

  // Check authorization
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/quotes');
    }
  }, [user, isLoading, router]);

  // Fetch all quotes
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchQuotes();
    }
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = quotes;

    if (searchEmail) {
      filtered = filtered.filter((q) =>
        q.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    if (filterBand !== 'ALL') {
      filtered = filtered.filter((q) => q.riskBand === filterBand);
    }

    setFilteredQuotes(filtered);
  }, [quotes, searchEmail, filterBand]);

  async function fetchQuotes() {
    try {
      setDataLoading(true);
      const response = await fetch('/api/admin/quotes');

      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }

      const data = await response.json();
      setQuotes(data.quotes || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDataLoading(false);
    }
  }

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin: All Quotes
          </h1>
          <p className="text-gray-600">
            View and manage all user quote requests
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Email
            </label>
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Risk Band
            </label>
            <select
              value={filterBand}
              onChange={(e) => setFilterBand(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ALL">All Bands</option>
              <option value="A">Band A (Low Risk)</option>
              <option value="B">Band B (Medium Risk)</option>
              <option value="C">Band C (High Risk)</option>
            </select>
          </div>
        </div>

        {/* Quotes Table */}
        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No quotes found</p>
            <Link
              href="/quotes"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to My Quotes
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      User Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      System Size
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      System Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Risk Band
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quote.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quote.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {quote.systemSizeKw || 'N/A'} kW
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        ${quote.systemPrice?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            quote.riskBand === 'A'
                              ? 'bg-green-100 text-green-800'
                              : quote.riskBand === 'B'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          Band {quote.riskBand}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/quotes/${quote.id}`}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredQuotes.length} of {quotes.length} quotes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
