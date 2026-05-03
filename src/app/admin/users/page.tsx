'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/AdminLayout';
import {
  Card,
  Input,
  Button,
  Badge,
  LoadingSpinner,
  EmptyState,
  Alert,
  SectionHeader,
} from '@/components/ui';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: string;
  quoteCount: number;
}

export default function AdminUsersPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'user' | 'admin'>('ALL');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/quotes');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      fetchUsers();
    }
  }, [user, token]);

  useEffect(() => {
    let filtered = users;

    if (searchEmail) {
      filtered = filtered.filter((u) =>
        u.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    if (filterRole !== 'ALL') {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchEmail, filterRole]);

  async function fetchUsers() {
    try {
      setDataLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const json = await response.json();
      setUsers(json.data?.users || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDataLoading(false);
    }
  }

  async function handleRoleChange(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      setUpdateLoading(userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error?.message || json.message || 'Failed to update user role');
      }

      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, role: newRole as 'user' | 'admin' } : u
        )
      );
      setSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdateLoading(null);
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

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <SectionHeader
          title="User Management"
          subtitle="Manage users and assign admin roles"
        />

        {/* Alerts */}
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

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Search by Email"
                placeholder="user@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="ALL">All Users</option>
                  <option value="user">Regular Users</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {dataLoading && (
          <Card>
            <div className="p-12">
              <LoadingSpinner message="Loading users..." />
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!dataLoading && filteredUsers.length === 0 && (
          <Card>
            <div className="p-12">
              <EmptyState
                icon="👥"
                title="No Users Found"
                description={users.length === 0 ? 'No users have registered yet.' : 'No users match your filters.'}
              />
            </div>
          </Card>
        )}

        {/* Users Table */}
        {!dataLoading && filteredUsers.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{users.length}</span> users
              </p>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Full Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quotes</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{u.fullName}</td>
                        <td className="px-6 py-4">
                          <Badge variant={u.role === 'admin' ? 'success' : 'info'}>
                            {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.quoteCount}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {user.id !== u.id ? (
                            <Button
                              variant={u.role === 'admin' ? 'danger' : 'primary'}
                              size="sm"
                              loading={updateLoading === u.id}
                              onClick={() => handleRoleChange(u.id, u.role)}
                            >
                              {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                            </Button>
                          ) : (
                            <span className="text-gray-500 text-sm font-medium">Current User</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
