import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800 border border-gray-300',
  success: 'bg-green-100 text-green-800 border border-green-300',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  danger: 'bg-red-100 text-red-800 border border-red-300',
  info: 'bg-blue-100 text-blue-800 border border-blue-300',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Status badge for quote status
export function StatusBadge({
  status,
}: {
  status: 'pending' | 'approved' | 'rejected';
}) {
  const variants = {
    pending: 'warning' as const,
    approved: 'success' as const,
    rejected: 'danger' as const,
  };

  const labels = {
    pending: '⏳ Pending',
    approved: '✓ Approved',
    rejected: '✗ Rejected',
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

// Risk band badge
export function RiskBandBadge({
  band,
}: {
  band: 'A' | 'B' | 'C';
}) {
  const variants = {
    A: 'success' as const,
    B: 'info' as const,
    C: 'warning' as const,
  };

  const labels = {
    A: 'Band A (Low Risk)',
    B: 'Band B (Medium Risk)',
    C: 'Band C (High Risk)',
  };

  return <Badge variant={variants[band]}>{labels[band]}</Badge>;
}
