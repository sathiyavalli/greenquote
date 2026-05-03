import React from 'react';

type BadgeType = 'success' | 'warning' | 'danger' | 'info' | 'primary';

interface BadgeProps {
  type?: BadgeType;
  children: React.ReactNode;
  className?: string;
}

const typeClasses: Record<BadgeType, string> = {
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  primary: 'bg-green-100 text-green-800',
};

export default function Badge({ type = 'info', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeClasses[type]} ${className}`}>
      {children}
    </span>
  );
}
