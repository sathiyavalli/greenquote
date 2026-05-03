import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function FormField({
  label,
  error,
  helperText,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
}
