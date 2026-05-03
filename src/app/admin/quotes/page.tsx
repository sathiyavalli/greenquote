'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/AdminLayout';
import {
  Card,
  Input,
  LoadingSpinner,
  EmptyState,
  RiskBandBadge,
  Alert,
  SectionHeader,
} from '@/components/ui';
import Link from 'next/link';
import { formatEuro } from '@/utils/currency';

interface Quote {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  systemSizeKw: number;
  systemPrice: number;
  riskBand: 'A' | 'B' | 'C';
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export default function AdminQuotesPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [filterBand, setFilterBand] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [sortBy, setSortBy] = useState<'system' | 'price' | 'created' | 'none'>('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/quotes');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      fetchQuotes();
    }
  }, [user, token]);

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

    // Apply sorting
    if (sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        let compareValue = 0;
        if (sortBy === 'system') {
          compareValue = a.systemSizeKw - b.systemSizeKw;
        } else if (sortBy === 'price') {
          compareValue = a.systemPrice - b.systemPrice;
        } else if (sortBy === 'created') {
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return sortOrder === 'asc' ? compareValue : -compareValue;
      });
    }

    setFilteredQuotes(filtered);
  }, [quotes, searchEmail, filterBand, sortBy, sortOrder]);

  async function fetchQuotes() {
    try {
      setDataLoading(true);
      const response = await fetch('/api/admin/quotes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }

      const json = await response.json();
      setQuotes(json.data?.quotes || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDataLoading(false);
    }
  }

  const handleSort = (column: 'system' | 'price' | 'created') => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and reset to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIndicator = (column: 'system' | 'price' | 'created') => {
    if (sortBy !== column) return ' ↕️';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <LoadingSpinner message="Loading..." />
        </div>
      </AdminLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <SectionHeader
          title="All Quotes"
          subtitle="View and manage all user quote requests across the platform"
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Search by Email"
              placeholder="user@example.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Filter by Risk Band
              </label>
              <select
                value={filterBand}
                onChange={(e) => setFilterBand(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <option value="ALL">All Bands</option>
                <option value="A">Band A (Low Risk - 6.9% APR)</option>
                <option value="B">Band B (Medium Risk - 8.9% APR)</option>
                <option value="C">Band C (High Risk - 11.9% APR)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {dataLoading && (
          <Card className="p-12">
            <LoadingSpinner message="Loading quotes..." />
          </Card>
        )}

        {/* Empty State */}
        {!dataLoading && filteredQuotes.length === 0 && (
          <Card>
            <div className="p-12">
              <EmptyState
                icon="📋"
                title="No Quotes Found"
                description={
                  quotes.length === 0
                    ? 'No quotes have been submitted yet.'
                    : 'No quotes match your filters.'
                }
                action={
                  quotes.length === 0
                    ? { label: 'Back to Dashboard', href: '/admin' }
                    : undefined
                }
              />
            </div>
          </Card>
        )}

        {/* Quotes Table */}
        {!dataLoading && filteredQuotes.length > 0 && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {filteredQuotes.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-900">{quotes.length}</span>{' '}
                quotes
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Full Name
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('system')}
                        title="Click to sort"
                      >
                        System{getSortIndicator('system')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('price')}
                        title="Click to sort"
                      >
                        Price{getSortIndicator('price')}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Risk Band
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('created')}
                        title="Click to sort"
                      >
                        Created{getSortIndicator('created')}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
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
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {quote.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {quote.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {quote.systemSizeKw} kW
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          {formatEuro(quote.systemPrice, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4">
                          <RiskBandBadge band={quote.riskBand} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(quote.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/admin/quotes/${quote.id}`}
                            className="text-green-600 hover:text-green-700 font-medium transition"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
