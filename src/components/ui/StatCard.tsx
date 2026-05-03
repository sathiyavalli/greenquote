import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  subtext,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm p-6
        hover:shadow-md transition-shadow duration-200
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-gray-500 text-xs mt-2">{subtext}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
