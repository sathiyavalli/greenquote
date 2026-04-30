'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quoteInputSchema, type QuoteInput } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';

interface QuoteFormData extends QuoteInput {}

export default function CreateQuotePage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteResult, setQuoteResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteInputSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      downPayment: 0,
    },
  });

  // Auto-fill user data
  if (user && !watch('fullName')) {
    setValue('fullName', user.fullName || '');
  }

  const onSubmit = async (data: QuoteFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setQuoteResult(null);

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: data.fullName,
          address: data.address,
          monthlyConsumptionKwh: Number(data.monthlyConsumptionKwh),
          systemSizeKw: Number(data.systemSizeKw),
          downPayment: data.downPayment ? Number(data.downPayment) : 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create quote');
        return;
      }

      const result = await response.json();
      setQuoteResult(result);

      // Auto-redirect to quote details after 2 seconds
      setTimeout(() => {
        router.push(`/quotes/${result.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to continue
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to request a solar quote.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Solar Quote Request
            </h1>
            <p className="text-gray-600">
              Provide your details below for a personalized solar financing quote.
            </p>
          </div>

          {quoteResult && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                ✓ Quote Created Successfully!
              </h3>
              <p className="text-green-700 mb-4">
                Redirecting to quote details in 2 seconds...
              </p>
              <div className="space-y-2 text-sm text-green-700">
                <p>
                  <strong>System Price:</strong> ${quoteResult.systemPrice.toFixed(2)}
                </p>
                <p>
                  <strong>Risk Band:</strong> {quoteResult.riskBand}
                </p>
                <p>
                  <strong>Offers:</strong> {quoteResult.offers.length} financing options available
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                id="address"
                type="text"
                {...register('address')}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="123 Main St, San Francisco, CA"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* Monthly Consumption */}
            <div>
              <label
                htmlFor="monthlyConsumptionKwh"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Monthly Consumption (kWh)
              </label>
              <input
                id="monthlyConsumptionKwh"
                type="number"
                step="10"
                {...register('monthlyConsumptionKwh', {
                  valueAsNumber: true,
                })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="1200"
              />
              <p className="mt-1 text-sm text-gray-500">
                Check your recent electricity bill for this number
              </p>
              {errors.monthlyConsumptionKwh && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.monthlyConsumptionKwh.message}
                </p>
              )}
            </div>

            {/* System Size */}
            <div>
              <label htmlFor="systemSizeKw" className="block text-sm font-medium text-gray-700 mb-1">
                System Size (kW)
              </label>
              <input
                id="systemSizeKw"
                type="number"
                step="0.1"
                {...register('systemSizeKw', {
                  valueAsNumber: true,
                })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="5.5"
              />
              <p className="mt-1 text-sm text-gray-500">
                Estimated solar system size for your home
              </p>
              {errors.systemSizeKw && (
                <p className="mt-1 text-sm text-red-600">{errors.systemSizeKw.message}</p>
              )}
            </div>

            {/* Down Payment (Optional) */}
            <div>
              <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 mb-1">
                Down Payment (Optional)
              </label>
              <input
                id="downPayment"
                type="number"
                step="100"
                {...register('downPayment', {
                  valueAsNumber: true,
                })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="0"
              />
              <p className="mt-1 text-sm text-gray-500">
                How much can you pay upfront? (Leave at 0 for none)
              </p>
              {errors.downPayment && (
                <p className="mt-1 text-sm text-red-600">{errors.downPayment.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
              >
                {isSubmitting ? 'Creating Quote...' : 'Get Your Quote'}
              </button>
            </div>

            {/* Back Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition duration-200"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
