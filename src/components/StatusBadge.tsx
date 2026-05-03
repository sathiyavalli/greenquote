import React from 'react';
import Badge from './Badge';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
  className?: string;
}

const statusConfig = {
  pending: { type: 'warning' as const, icon: '⏳', label: 'Pending' },
  approved: { type: 'success' as const, icon: '✓', label: 'Approved' },
  rejected: { type: 'danger' as const, icon: '✕', label: 'Rejected' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge type={config.type} className={className}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
