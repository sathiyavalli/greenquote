'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Card,
  EmptyState,
  LoadingSpinner,
  RiskBandBadge,
  SectionHeader,
} from '@/components/ui';
import { formatEuro } from '@/utils/currency';

interface Quote {
  id: string;
  fullName: string;
  email: string;
  systemSizeKw: number;
  systemPrice: number;
  riskBand: 'A' | 'B' | 'C';
  createdAt: string;
}

interface Filters {
  minPrice: number | null;
  maxPrice: number | null;
  minSize: number | null;
  maxSize: number | null;
  startDate: string;
  endDate: string;
  riskBands: ('A' | 'B' | 'C')[];
}

type SortOption = 'none' | 'price-asc' | 'price-desc' | 'size-asc' | 'size-desc';

export default function QuotesPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    minPrice: null,
    maxPrice: null,
    minSize: null,
    maxSize: null,
    startDate: '',
    endDate: '',
    riskBands: [],
  });
  const [sortBy, setSortBy] = useState<SortOption>('none');

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
      return;
    }

    if (!isLoading && user?.role === 'admin') {
      router.push('/admin/quotes');
      return;
    }

    if (token && !isLoading) {
      fetchQuotes();
    }
  }, [token, isLoading, user?.role, router]);

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

  // Filter quotes based on selected filters
  const filteredQuotes = useMemo(() => {
    let results = quotes.filter((quote) => {
      // Price filter
      if (filters.minPrice !== null && quote.systemPrice < filters.minPrice) return false;
      if (filters.maxPrice !== null && quote.systemPrice > filters.maxPrice) return false;

      // Size filter
      if (filters.minSize !== null && quote.systemSizeKw < filters.minSize) return false;
      if (filters.maxSize !== null && quote.systemSizeKw > filters.maxSize) return false;

      // Risk band filter
      if (filters.riskBands.length > 0 && !filters.riskBands.includes(quote.riskBand)) {
        return false;
      }

      // Date filter
      if (filters.startDate) {
        const quoteDate = new Date(quote.createdAt);
        const startDate = new Date(filters.startDate);
        if (quoteDate < startDate) return false;
      }

      if (filters.endDate) {
        const quoteDate = new Date(quote.createdAt);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Include entire day
        if (quoteDate > endDate) return false;
      }

      return true;
    });

    // Apply sorting
    if (sortBy !== 'none') {
      results.sort((a, b) => {
        if (sortBy === 'price-asc') return a.systemPrice - b.systemPrice;
        if (sortBy === 'price-desc') return b.systemPrice - a.systemPrice;
        if (sortBy === 'size-asc') return a.systemSizeKw - b.systemSizeKw;
        if (sortBy === 'size-desc') return b.systemSizeKw - a.systemSizeKw;
        return 0;
      });
    }

    return results;
  }, [quotes, filters, sortBy]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRiskBandToggle = (band: 'A' | 'B' | 'C') => {
    setFilters((prev) => ({
      ...prev,
      riskBands: prev.riskBands.includes(band)
        ? prev.riskBands.filter((b) => b !== band)
        : [...prev.riskBands, band],
    }));
  };

  const resetFilters = () => {
    setFilters({
      minPrice: null,
      maxPrice: null,
      minSize: null,
      maxSize: null,
      startDate: '',
      endDate: '',
      riskBands: [],
    });
    setSortBy('none');
  };

  const hasActiveFilters =
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.minSize !== null ||
    filters.maxSize !== null ||
    filters.startDate ||
    filters.endDate ||
    filters.riskBands.length > 0 ||
    sortBy !== 'none';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner message="Loading your quotes..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasQuotes = quotes.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Solar Quotes</h1>
              <p className="mt-1 text-gray-600">Manage your personalized solar financing quotes</p>
            </div>
            <Button onClick={() => router.push('/quotes/create')}>
              Request New Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && <LoadingSpinner fullPage message="Loading your quotes..." />}

        {/* Filter Section - Desktop */}
        {hasQuotes && !loading && (
          <div className="mb-6 flex flex-col lg:flex-col gap-6">
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block max-w-7xl">
              <Card className="p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                  {/* System Price Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      System Price
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Min (€)"
                        value={filters.minPrice ?? ''}
                        onChange={(e) =>
                          handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="number"
                        placeholder="Max (€)"
                        value={filters.maxPrice ?? ''}
                        onChange={(e) =>
                          handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* System Size Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      System Size (kW)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minSize ?? ''}
                        onChange={(e) =>
                          handleFilterChange('minSize', e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxSize ?? ''}
                        onChange={(e) =>
                          handleFilterChange('maxSize', e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Created Date
                    </label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    >
                      <option value="none">None</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="size-asc">Size: Small to Large</option>
                      <option value="size-desc">Size: Large to Small</option>
                    </select>
                  </div>

                  {/* Risk Band Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Risk Band
                    </label>
                    <div className="space-y-2">
                      {(['A', 'B', 'C'] as const).map((band) => (
                        <label key={band} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.riskBands.includes(band)}
                            onChange={() => handleRiskBandToggle(band)}
                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">Band {band}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="flex flex-col justify-left">
                    <button
                      onClick={resetFilters}
                      disabled={!hasActiveFilters}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasActiveFilters
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Mobile Filter Toggle + Content */}
            <div className="flex-1">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between"
                >
                  <span>🔍 {hasActiveFilters ? `Filters (${Object.values(filters).filter(v => v).length})` : 'Filters'}</span>
                  <span>{showFilters ? '▼' : '▶'}</span>
                </button>

                {/* Mobile Filter Panel */}
                {showFilters && (
                  <Card className="mt-4 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                      <button
                        onClick={resetFilters}
                        disabled={!hasActiveFilters}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          hasActiveFilters
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Reset
                      </button>
                    </div>

                    <div className="space-y-5">
                      {/* System Price Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          System Price
                        </label>
                        <div className="space-y-2">
                          <input
                            type="number"
                            placeholder="Min (€)"
                            value={filters.minPrice ?? ''}
                            onChange={(e) =>
                              handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : null)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="number"
                            placeholder="Max (€)"
                            value={filters.maxPrice ?? ''}
                            onChange={(e) =>
                              handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : null)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* System Size Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          System Size (kW)
                        </label>
                        <div className="space-y-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.minSize ?? ''}
                            onChange={(e) =>
                              handleFilterChange('minSize', e.target.value ? Number(e.target.value) : null)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxSize ?? ''}
                            onChange={(e) =>
                              handleFilterChange('maxSize', e.target.value ? Number(e.target.value) : null)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Date Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Created Date
                        </label>
                        <div className="space-y-2">
                          <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        >
                          <option value="none">None</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="size-asc">Size: Small to Large</option>
                          <option value="size-desc">Size: Large to Small</option>
                        </select>
                      </div>

                      {/* Risk Band Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Risk Band
                        </label>
                        <div className="space-y-2">
                          {(['A', 'B', 'C'] as const).map((band) => (
                            <label key={band} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.riskBands.includes(band)}
                                onChange={() => handleRiskBandToggle(band)}
                                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Band {band}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quotes Display - Outside Filter Section */}
        {/* Empty State */}
        {!hasQuotes && !loading && (
          <Card className="p-12">
            <EmptyState
              icon="☀️"
              title="No Quotes Yet"
              description="Get started by requesting your first solar financing pre-qualification quote."
              action={{
                label: 'Get Your First Quote',
                href: '/quotes/create',
              }}
            />
          </Card>
        )}

        {/* No Filter Results */}
        {hasQuotes && filteredQuotes.length === 0 && !loading && (
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">No quotes match your filters.</p>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </Card>
        )}

        {/* Quotes Table */}
        {filteredQuotes.length > 0 && !loading && (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredQuotes.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{quotes.length}</span> quote
                {filteredQuotes.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Full Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">System Size</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">System Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Risk Band</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.map((quote) => (
                      <tr
                        key={quote.id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(quote.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{quote.fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{quote.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{quote.systemSizeKw} kW</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatEuro(quote.systemPrice, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <RiskBandBadge band={quote.riskBand} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push(`/quotes/${quote.id}`)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
