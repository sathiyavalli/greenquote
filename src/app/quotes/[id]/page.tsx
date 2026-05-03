'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { QuoteDetailsComponent } from '@/components/QuoteDetails';
import { Alert, Button, Card, LoadingSpinner, SectionHeader } from '@/components/ui';

interface QuoteData {
  id: string;
  fullName: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment: number;
  systemPrice: number;
  principalAmount: number;
  riskBand: 'A' | 'B' | 'C';
  offers: Array<{
    termYears: number;
    apr: number;
    principalUsed: number;
    monthlyPayment: number;
  }>;
  createdAt: Date | string;
}

export default function QuoteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { token, isLoading: authLoading } = useAuth();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quoteId = params.id as string;

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      router.push('/login');
      return;
    }

    fetchQuote();
  }, [token, authLoading, quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/quotes/${quoteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Quote not found');
        } else if (response.status === 401) {
          router.push('/login');
          return;
        } else {
          setError('Failed to load quote');
        }
        return;
      }

      const json = await response.json();
      setQuote(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage message="Loading quote..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <Alert type="error" title="Error" message={error} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => router.push('/quotes')}>
                Back to Quotes
              </Button>
              <Button variant="secondary" onClick={() => router.push('/quotes/create')}>
                Create New Quote
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Quote not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="Your Solar Quote"
          subtitle={`Quote ID: ${quote.id}`}
          action={{ label: 'Back', onClick: () => router.back() }}
        />

        {/* Quote Details */}
        <QuoteDetailsComponent quote={quote} />

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="w-full"
          >
            Print Quote
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push('/quotes/create')}
            className="w-full"
          >
            Create Another Quote
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/quotes')}
            className="w-full"
          >
            View All Quotes
          </Button>
        </div>
      </div>
    </div>
  );
}
