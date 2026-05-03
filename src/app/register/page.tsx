'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, type RegisterInput } from '@/utils/validation';
import { Card, Input, Button, Alert, LoadingSpinner } from '@/components/ui';

function RegisterPageContent() {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const showQuoteMessage = intent === 'quote';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const email = watch('email');
  const [emailError, setEmailError] = useState<string>('');
  const [emailExists, setEmailExists] = useState<boolean>(false);
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Real-time email validation and existence check
  useEffect(() => {
    if (!email) {
      setEmailError('');
      setEmailExists(false);
      setCheckingEmail(false);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email address');
      setEmailExists(false);
      setCheckingEmail(false);
      return;
    }

    setEmailError('');

    // Debounce email existence check
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setCheckingEmail(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        const payload = data.data || data;
        if (payload.exists) {
          setEmailError('Email already exists');
          setEmailExists(true);
        } else {
          setEmailError('');
          setEmailExists(false);
        }
      } catch (error) {
        console.error('Error checking email:', error);
        setEmailError('');
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [email]);

  const onSubmit = async (data: RegisterInput) => {
    // Prevent submission if email is invalid or exists
    if (emailExists || emailError) {
      return;
    }

    setIsLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error?.message || 'Registration failed');
        return;
      }
      // Auto-login: store token and redirect to quote form
      const { token, user } = json.data;
      localStorage.setItem('auth-token', token);
      localStorage.setItem('auth-user', JSON.stringify(user));
      setIsRedirecting(true);
      // Force full navigation so auth context is initialized from storage.
      window.location.assign(user.role === 'admin' ? '/admin' : '/quotes/create');
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return <LoadingSpinner fullPage message="Creating your account and setting things up..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-gray-900 flex flex-col items-center justify-center px-4 py-12">
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
            <h1 className="font-display text-4xl mt-4">Create your account.</h1>
            <p className="text-green-100/80 mt-4">
              Save quotes, compare offers, and move from interest to installation faster.
            </p>
          </div>
          <div className="text-sm text-green-100/80">
            Already have an account? Sign in anytime.
          </div>
        </div>

        <Card className="w-full p-8 lg:p-10 rounded-3xl shadow-2xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-green-600">Sign up</p>
            <h2 className="font-display text-3xl text-gray-900 mt-3">Start your journey</h2>
            <p className="text-sm text-gray-500 mt-2">Create your account in a few steps.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {showQuoteMessage && (
              <Alert
                type="info"
                message="Create an account to get your solar quote in minutes."
              />
            )}

            {serverError && <Alert type="error" message={serverError} />}

            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              {...register('fullName')}
              error={errors.fullName?.message}
            />

            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                placeholder="jane@example.com"
                {...register('email')}
                error={emailError || errors.email?.message}
              />
              {checkingEmail && email && (
                <div className="text-xs text-blue-600 mt-1">Checking email...</div>
              )}
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              {...register('password')}
              error={errors.password?.message}
              helperText="Minimum 8 characters, 1 uppercase letter, 1 number"
            />

            <Button fullWidth loading={isLoading} disabled={!!emailError || emailExists || checkingEmail}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link
              href={showQuoteMessage ? '/login?intent=quote' : '/login'}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage message="Preparing registration..." />}>
      <RegisterPageContent />
    </Suspense>
  );
}
