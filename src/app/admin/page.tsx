'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/AdminLayout';
import { Card, LoadingSpinner, Button, StatCard, Alert } from '@/components/ui';
import { formatEuro } from '@/utils/currency';

interface AdminStats {
  totalUsers: number;
  adminCount: number;
  totalQuotes: number;
  quotesThisMonth: number;
  totalSystemPrice: number;
  averageSystemPrice: number;
}

export default function AdminDashboard() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/quotes');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      fetchStats();
    }
  }, [user, token]);

  async function fetchStats() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const json = await response.json();
      setStats(json.data?.stats ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

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

  const statCards = stats ? [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      subtext: `${stats.adminCount} admin${stats.adminCount !== 1 ? 's' : ''}`,
      icon: '👥',
    },
    {
      label: 'Total Quotes',
      value: stats.totalQuotes,
      subtext: `${stats.quotesThisMonth} this month`,
      icon: '📋',
    },
    {
      label: 'Total System Value',
      value: formatEuro(stats.totalSystemPrice, { maximumFractionDigits: 0 }),
      subtext: `Avg: ${formatEuro(stats.averageSystemPrice, { maximumFractionDigits: 0 })}`,
      icon: '💰',
    },
  ] : [];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, admin. Here&apos;s your system overview.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-12">
            <LoadingSpinner message="Loading stats..." fullPage={false} />
          </Card>
        )}

        {/* Stats Grid */}
        {!loading && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statCards.map((card, index) => (
                <StatCard
                  key={index}
                  label={card.label}
                  value={card.value}
                  subtext={card.subtext}
                  icon={card.icon}
                />
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => router.push('/admin/quotes/create')}
                  className="w-full"
                >
                  ✨ Create Quote
                </Button>
                <Button
                  onClick={() => router.push('/admin/quotes')}
                  className="w-full"
                >
                  📋 View All Quotes
                </Button>
                <Button
                  onClick={() => router.push('/admin/users')}
                  className="w-full"
                >
                  👥 Manage Users
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/quotes')}
                  className="w-full"
                >
                  ← Back to User View
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
