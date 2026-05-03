'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to quotes
    if (!isLoading && token) {
      router.push('/quotes');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If user is logged in, redirect (handled above)
  if (token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-emerald-600" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2), transparent 45%)',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="text-white">
              <p className="uppercase tracking-[0.3em] text-xs text-green-100 mb-4">
                Solar finance simplified
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
                Plan your solar upgrade with clarity and control.
              </h1>
              <p className="text-lg text-green-50/90 mt-6 max-w-xl">
                Get a fast financing estimate, compare payment terms, and move forward with confidence.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login?intent=quote"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-green-700 font-semibold shadow-lg hover:shadow-xl transition"
                >
                  Get Quote
                </Link>
                <Link
                  href="/register?intent=quote"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/70 text-white font-semibold hover:bg-white/10 transition"
                >
                  Create account
                </Link>
              </div>
            </div>

            <div className="bg-white/95 rounded-3xl p-6 shadow-2xl border border-white/40">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-xs uppercase tracking-widest text-green-600">Estimate</p>
                  <p className="font-display text-2xl text-gray-900 mt-2">€124/mo</p>
                  <p className="text-xs text-gray-500 mt-1">10-year term</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-widest text-emerald-600">APR</p>
                  <p className="font-display text-2xl text-gray-900 mt-2">6.9%</p>
                  <p className="text-xs text-gray-500 mt-1">Band A</p>
                </div>
                <div className="rounded-2xl bg-white border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500">System size</p>
                  <p className="font-display text-2xl text-gray-900 mt-2">6.2 kW</p>
                  <p className="text-xs text-gray-500 mt-1">Typical home</p>
                </div>
                <div className="rounded-2xl bg-white border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500">Down payment</p>
                  <p className="font-display text-2xl text-gray-900 mt-2">€2,500</p>
                  <p className="text-xs text-gray-500 mt-1">Flexible</p>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  Answer a few questions and we will calculate your best financing options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Fast pre-qualification',
                desc: 'Get a quote in minutes with no impact to your credit score.',
              },
              {
                title: 'Transparent pricing',
                desc: 'See system size, APR, and monthly payment options upfront.',
              },
              {
                title: 'Secure by design',
                desc: 'We protect your data with modern encryption and strict access controls.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-display text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
