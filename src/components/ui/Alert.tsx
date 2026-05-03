import React from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  closable?: boolean;
  className?: string;
}

const typeStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✓',
    iconBg: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '✕',
    iconBg: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: '!',
    iconBg: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ',
    iconBg: 'text-blue-600',
  },
};

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  closable = true,
}: AlertProps) {
  const styles = typeStyles[type];

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} ${styles.text}
        border rounded-lg p-4 flex gap-3
      `}
      role="alert"
    >
      <span className={`${styles.iconBg} font-bold text-lg flex-shrink-0`}>
        {styles.icon}
      </span>
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className={title ? 'text-sm mt-1' : ''}>{message}</p>
      </div>
      {closable && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-lg hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
}
