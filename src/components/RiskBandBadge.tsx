import React from 'react';

interface RiskBandBadgeProps {
  band: 'A' | 'B' | 'C';
  className?: string;
}

const bandConfig = {
  A: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Band A (Low Risk)', apr: '6.9%' },
  B: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Band B (Medium Risk)', apr: '8.9%' },
  C: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Band C (High Risk)', apr: '11.9%' },
};

export default function RiskBandBadge({ band, className = '' }: RiskBandBadgeProps) {
  const config = bandConfig[band];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${className}`}>
      <span className="font-bold">{band}</span>
      <span className="text-xs opacity-75">({config.apr})</span>
    </div>
  );
}
