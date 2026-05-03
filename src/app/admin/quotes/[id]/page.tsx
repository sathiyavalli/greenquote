'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/AdminLayout';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  LoadingSpinner,
  RiskBandBadge,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { formatEuro } from '@/utils/currency';

interface Offer {
  id: string;
  termYears: number;
  apr: number;
  monthlyPayment: number;
}

interface Quote {
  id: string;
  fullName: string;
  email: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment?: number;
  systemPrice: number;
  principalAmount: number;
  riskBand: 'A' | 'B' | 'C';
  status: 'pending' | 'approved' | 'rejected';
  offers: Offer[];
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

export default function AdminQuoteDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/quotes');
    }
  }, [user, isLoading, router]);

  // Fetch quote
  useEffect(() => {
    if (user?.role === 'admin' && token) {
      fetchQuote();
    }
  }, [user, token, params.id]);

  async function fetchQuote() {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotes/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const json = await response.json();
      setQuote(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: 'pending' | 'approved' | 'rejected') {
    if (!quote) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/quotes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error?.message || json.message || 'Failed to update status');
      }

      const json = await response.json();
      setQuote(json.data?.quote ?? null);
      setSuccess(`Quote status updated to ${newStatus}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!quote) return;

    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/quotes/${params.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete quote');
      }

      setSuccess('Quote deleted successfully');
      setTimeout(() => router.push('/admin/quotes'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUpdating(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullPage message="Loading..." />;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <SectionHeader
          title="Quote Details"
          subtitle="Review user details and manage quote status"
          action={{ label: 'Back to Quotes', onClick: () => router.push('/admin/quotes') }}
        />

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}
        {success && (
          <div className="mb-6">
            <Alert type="success" message={success} onClose={() => setSuccess(null)} />
          </div>
        )}

        {loading && (
          <Card className="p-12">
            <LoadingSpinner message="Loading quote..." />
          </Card>
        )}

        {!loading && !quote && (
          <Card className="p-12">
            <EmptyState
              icon="📄"
              title="Quote not found"
              description="The requested quote does not exist or was removed."
              action={{ label: 'Back to Quotes', href: '/admin/quotes' }}
            />
          </Card>
        )}

        {!loading && quote && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <div className="mt-2">
                    <StatusBadge status={quote.status} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={updating || quote.status === 'pending'}
                    onClick={() => handleStatusChange('pending')}
                    className="w-full"
                  >
                    Mark as Pending
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={updating || quote.status === 'approved'}
                    onClick={() => handleStatusChange('approved')}
                    className="w-full"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={updating || quote.status === 'rejected'}
                    onClick={() => handleStatusChange('rejected')}
                    className="w-full"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-gray-900 font-medium">{quote.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900 font-medium">{quote.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-900">{quote.address}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Consumption</p>
                    <p className="text-gray-900 font-medium">
                      {quote.monthlyConsumptionKwh} kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">System Size</p>
                    <p className="text-gray-900 font-medium">{quote.systemSizeKw} kW</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk Band</p>
                    <div className="mt-1">
                      <RiskBandBadge band={quote.riskBand} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-2">System Price</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatEuro(quote.systemPrice, { maximumFractionDigits: 2 })}
                </p>
              </Card>
              <Card className="p-6 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-2">Down Payment</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatEuro(quote.downPayment || 0, { maximumFractionDigits: 2 })}
                </p>
              </Card>
              <Card className="p-6 border-l-4 border-green-500">
                <p className="text-sm text-gray-600 mb-2">Principal Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatEuro(quote.principalAmount, { maximumFractionDigits: 2 })}
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Financing Options (Monthly Payments)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quote.offers.map((offer) => (
                  <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {offer.termYears} Years
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">APR</p>
                        <p className="text-gray-900 font-medium">{offer.apr.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Monthly Payment</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatEuro(offer.monthlyPayment, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gray-50">
              <p className="text-sm text-gray-600">
                Created: {new Date(quote.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Last Updated: {new Date(quote.updatedAt).toLocaleString()}
              </p>
            </Card>

            <Card className="p-6 border border-red-200 bg-red-50 print-hidden">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Danger Zone</h3>
              <Button
                variant="danger"
                loading={updating}
                onClick={handleDelete}
              >
                Delete Quote
              </Button>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
