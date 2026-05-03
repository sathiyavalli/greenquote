'use client';

import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';
import { Card, Input, Button, Alert, LoadingSpinner } from '@/components/ui';

function LoginPageContent() {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { login, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const showQuoteMessage = intent === 'quote';

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && token) {
      const storedUser = localStorage.getItem('auth-user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        router.push(user.role === 'admin' ? '/admin' : '/quotes');
      } else {
        router.push('/quotes');
      }
    }
  }, [token, authLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const email = watch('email');
  const [emailError, setEmailError] = useState<string>('');

  // Real-time email validation
  useEffect(() => {
    if (!email) {
      setEmailError('');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  }, [email]);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setServerError('');
    try {
      await login(data.email, data.password);
      setIsRedirecting(true);
      
      // Get user from localStorage to check role
      const storedUser = localStorage.getItem('auth-user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(showQuoteMessage ? '/quotes/create' : '/quotes');
        }
      } else {
        router.push(showQuoteMessage ? '/quotes/create' : '/quotes');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setServerError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isRedirecting) {
    return (
      <LoadingSpinner
        fullPage
        message={isRedirecting ? 'Signing you in and preparing your dashboard...' : 'Checking your session...'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-gray-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-white hover:text-green-200 transition-colors"
        title="Back to home"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Link>
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="hidden lg:flex flex-col justify-between rounded-3xl bg-white/10 border border-white/20 p-8 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-green-100">GreenQuote</p>
            <h1 className="font-display text-4xl mt-4">Welcome back.</h1>
            <p className="text-green-100/80 mt-4">
              Review your quotes, explore payment terms, and keep your solar plan moving.
            </p>
          </div>
          <div className="text-sm text-green-100/80">
            Need an account? Create one in under a minute.
          </div>
        </div>

        <Card className="w-full p-8 lg:p-10 rounded-3xl shadow-2xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-green-600">Sign in</p>
            <h2 className="font-display text-3xl text-gray-900 mt-3">Access your account</h2>
            <p className="text-sm text-gray-500 mt-2">Use your email and password to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {showQuoteMessage && (
              <Alert
                type="info"
                message="Please sign in to request a quote. New here? Create an account to get started."
              />
            )}

            {serverError && <Alert type="error" message={serverError} />}

            <Input
              label="Email Address"
              type="email"
              placeholder="jane@example.com"
              {...register('email')}
              error={emailError || errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              {...register('password')}
              error={errors.password?.message}
            />

            <Button fullWidth loading={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href={showQuoteMessage ? '/register?intent=quote' : '/register'}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Create one free
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage message="Preparing sign in..." />}>
      <LoginPageContent />
    </Suspense>
  );
}
