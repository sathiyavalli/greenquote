import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullPage?: boolean;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function LoadingSpinner({
  size = 'md',
  message,
  fullPage = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizeStyles[size]}
          border-4 border-gray-200 border-t-green-500 rounded-full
          animate-spin
        `}
      />
      {message && <p className="text-gray-600 text-sm font-medium">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
