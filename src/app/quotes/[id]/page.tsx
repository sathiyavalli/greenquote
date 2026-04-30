'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { QuoteDetailsComponent } from '@/components/QuoteDetails';

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

      const data = await response.json();
      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/quotes')}
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition"
              >
                Back to Quotes
              </button>
              <button
                onClick={() => router.push('/quotes/create')}
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition"
              >
                Create New Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Quote not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-green-600 hover:text-green-700 font-medium mb-4 inline-flex items-center"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Your Solar Quote</h1>
          <p className="text-gray-600 mt-2">
            Quote ID: <code className="text-xs bg-gray-100 px-2 py-1 rounded">{quote.id}</code>
          </p>
        </div>

        {/* Quote Details */}
        <QuoteDetailsComponent quote={quote} />

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              window.print();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
          >
            📄 Print Quote
          </button>
          <button
            onClick={() => router.push('/quotes/create')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition"
          >
            ➕ Create Another Quote
          </button>
          <button
            onClick={() => router.push('/quotes')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
          >
            📋 View All Quotes
          </button>
        </div>
      </div>
    </div>
  );
}
