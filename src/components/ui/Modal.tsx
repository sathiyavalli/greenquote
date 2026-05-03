import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  actions,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-3 px-6 py-4 border-t border-gray-200 justify-end">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${
                    action.variant === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : action.variant === 'secondary'
                      ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
