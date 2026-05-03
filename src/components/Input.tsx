import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  className?: string;
}

export default function Input({ label, error, helper, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <input
        className={`
          w-full px-4 py-2 rounded-lg border transition-colors
          ${error
            ? 'border-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
            : 'border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500'
          }
          placeholder-gray-500
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helper && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
    </div>
  );
}
