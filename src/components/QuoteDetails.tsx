'use client';

import { useState, useRef, useEffect } from 'react';
import { RiskBand } from '@/utils/pricing';
import { formatEuro } from '@/utils/currency';
import AmortizationSchedule from '@/components/AmortizationSchedule';
import { calculateAmortizationSchedule } from '@/utils/amortization';

interface QuoteDetailsProps {
  id: string;
  fullName: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment: number;
  systemPrice: number;
  principalAmount: number;
  riskBand: RiskBand;
  offers: Array<{
    termYears: number;
    apr: number;
    principalUsed: number;
    monthlyPayment: number;
  }>;
  createdAt: Date | string;
}

const RISK_BAND_COLORS: Record<RiskBand, { bg: string; text: string; badge: string }> = {
  A: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  B: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  C: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
};

const RISK_BAND_DESCRIPTIONS: Record<RiskBand, string> = {
  A: 'Excellent - Lowest interest rates available',
  B: 'Good - Moderate interest rates',
  C: 'Fair - Higher interest rates',
};

export function QuoteDetailsComponent({ quote }: { quote: QuoteDetailsProps }) {
  const colors = RISK_BAND_COLORS[quote.riskBand];
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number | null>(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const amortizationRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to amortization schedule when a new offer is selected
  useEffect(() => {
    if (selectedOfferIndex !== null && amortizationRef.current) {
      setTimeout(() => {
        amortizationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedOfferIndex]);

  const selectedOffer = selectedOfferIndex !== null ? quote.offers[selectedOfferIndex] : null;

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className={`${colors.bg} border border-gray-200 rounded-lg p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
              Quote Summary
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Full Name</dt>
                <dd className="text-lg font-medium text-gray-900">{quote.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Address</dt>
                <dd className="text-lg font-medium text-gray-900">{quote.address}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
              System Details
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Monthly Consumption</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {quote.monthlyConsumptionKwh.toLocaleString()}{' '}
                  <span className="text-sm font-normal text-gray-600">kWh/month</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">System Size</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {quote.systemSizeKw}{' '}
                  <span className="text-sm font-normal text-gray-600">kW</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Request Date</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {new Date(quote.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 text-center">System Price</p>
            <p className="text-2xl font-bold text-gray-900 text-center">
              {formatEuro(quote.systemPrice, { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 text-center">Down Payment</p>
            <p className="text-2xl font-bold text-gray-900 text-center">
              {formatEuro(quote.downPayment, { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 text-center font-medium">Principal to Finance</p>
            <p className="text-2xl font-bold text-green-700 text-center">
              {formatEuro(quote.principalAmount, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Risk Band */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Your Risk Band</h4>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full font-bold ${colors.badge} text-lg`}>
              Band {quote.riskBand}
            </span>
            <p className={`${colors.text} font-medium`}>
              {RISK_BAND_DESCRIPTIONS[quote.riskBand]}
            </p>
          </div>
        </div>
      </div>

      {/* Financing Offers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Financing Options</h3>

        <div className="space-y-4">
          {quote.offers.map((offer, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-5 hover:border-green-500 hover:bg-green-50 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {offer.termYears}-Year Term
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Fixed APR: <span className="font-semibold text-gray-900">{offer.apr}%</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Monthly Payment</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatEuro(offer.monthlyPayment, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-3 text-sm mb-4">
                <p className="text-gray-600">
                  Total payments:{' '}
                  <span className="font-semibold text-gray-900">
                    {offer.termYears * 12} months
                  </span>
                  {' | '}Total amount financed:{' '}
                  <span className="font-semibold text-gray-900">
                    {formatEuro(offer.principalUsed, { maximumFractionDigits: 2 })}
                  </span>
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedOfferIndex(selectedOfferIndex === idx ? null : idx);
                  setShowFullSchedule(false);
                }}
                className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                  selectedOfferIndex === idx
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {selectedOfferIndex === idx
                  ? 'Hide Amortization Schedule'
                  : 'View Amortization Schedule'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>💡 Tip:</strong> Choose the term that best fits your budget. Shorter terms
            mean lower total interest, while longer terms mean lower monthly payments.
          </p>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className="bg-gray-900 text-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Total Cost by Term</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quote.offers.map((offer, idx) => {
            const schedule = calculateAmortizationSchedule(
              quote.principalAmount,
              offer.apr,
              offer.termYears,
              offer.monthlyPayment
            );
            const totalCost = schedule.totalPayment;
            const totalInterest = schedule.totalInterest;

            return (
              <div key={idx} className="border border-gray-700 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">{offer.termYears}-Year Term</p>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt>Principal:</dt>
                    <dd>{formatEuro(quote.principalAmount, { maximumFractionDigits: 2 })}</dd>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <dt>Interest:</dt>
                    <dd>{formatEuro(totalInterest, { maximumFractionDigits: 2 })}</dd>
                  </div>
                  <div className="flex justify-between text-green-400 font-bold border-t border-gray-700 pt-1">
                    <dt>Total Cost:</dt>
                    <dd>{formatEuro(totalCost, { maximumFractionDigits: 2 })}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </div>

      {/* Amortization Schedule Section */}
      {selectedOffer && (
        <div ref={amortizationRef} className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Detailed Payment Schedule ({selectedOffer.termYears}-Year Term)
            </h3>
            <button
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              className="text-sm font-medium text-green-600 hover:text-green-700 underline"
            >
              {showFullSchedule
                ? 'Show First 12 Months'
                : `Show All ${selectedOffer.termYears * 12} Payments`}
            </button>
          </div>
          <AmortizationSchedule
            offer={selectedOffer}
            principal={quote.principalAmount}
            showFullSchedule={showFullSchedule}
          />
        </div>
      )}
    </div>
  );
}
