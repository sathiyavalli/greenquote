'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quoteInputSchema, type QuoteInput } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Alert, Input, FormField, LoadingSpinner } from '@/components/ui';

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

  // Redirect admins to the admin quotes view.
  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      router.push('/admin/quotes');
    }
  }, [user?.role, authLoading, router]);

  // Auto-fill user data when auth state becomes available.
  useEffect(() => {
    if (user && !watch('fullName')) {
      setValue('fullName', user.fullName || '');
    }
  }, [user, watch, setValue]);

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
        setError(errorData.error?.message || errorData.message || 'Failed to create quote');
        return;
      }

      const json = await response.json();
      const quote = json.data;
      setQuoteResult(quote);

      // Scroll to top to show success message
      window.scrollTo(0, 0);

      // Auto-redirect to quote details after 2 seconds
      setTimeout(() => {
        router.push(`/quotes/${quote.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullPage message="Loading..." />;
  }

  // Show loading if redirecting admin
  if (user?.role === 'admin') {
    return <LoadingSpinner fullPage message="Redirecting..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to request a solar quote.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Solar Quote Request</h1>
            <p className="text-gray-600 mt-2">
              Provide your details below for a personalized solar financing quote.
            </p>
          </div>

          {quoteResult && (
            <Alert
              type="success"
              title="Quote Created Successfully!"
              message="Redirecting to quote details..."
              className="mb-6"
            />
          )}

          {error && (
            <Alert type="error" title="Error" message={error} className="mb-6" />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <FormField label="Email Address" required>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                helperText="Your registered email"
              />
            </FormField>

            {/* Full Name */}
            <FormField
              label="Full Name"
              error={errors.fullName?.message}
              required
            >
              <Input
                {...register('fullName')}
                disabled={isSubmitting}
                placeholder="John Doe"
              />
            </FormField>

            {/* Address */}
            <FormField
              label="Street Address"
              error={errors.address?.message}
              required
            >
              <Input
                {...register('address')}
                disabled={isSubmitting}
                placeholder="123 Main St, San Francisco, CA"
              />
            </FormField>

            {/* Monthly Consumption */}
            <FormField
              label="Monthly Consumption (kWh)"
              error={errors.monthlyConsumptionKwh?.message}
              helperText="Check your recent electricity bill for this number"
              required
            >
              <Input
                type="number"
                step="10"
                {...register('monthlyConsumptionKwh', {
                  valueAsNumber: true,
                })}
                disabled={isSubmitting}
                placeholder="1200"
              />
            </FormField>

            {/* System Size */}
            <FormField
              label="System Size (kW)"
              error={errors.systemSizeKw?.message}
              helperText="Estimated solar system size for your home"
              required
            >
              <Input
                type="number"
                step="0.5"
                {...register('systemSizeKw', {
                  valueAsNumber: true,
                })}
                disabled={isSubmitting}
                placeholder="5.5"
              />
            </FormField>

            {/* Down Payment */}
            <FormField
              label="Down Payment (Optional)"
              error={errors.downPayment?.message}
              helperText="How much can you pay upfront? (Leave at 0 for none)"
            >
              <Input
                type="number"
                step="100"
                {...register('downPayment', {
                  valueAsNumber: true,
                })}
                disabled={isSubmitting}
                placeholder="0"
              />
            </FormField>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth
                className="flex-1"
              >
                {isSubmitting ? 'Creating Quote...' : 'Get Your Quote'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                fullWidth
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
