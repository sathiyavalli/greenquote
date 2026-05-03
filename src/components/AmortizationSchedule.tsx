'use client';

import React, { useMemo, forwardRef } from 'react';
import {
  calculateAmortizationSchedule,
  formatCurrency,
  formatDate,
} from '@/utils/amortization';
import { calculateMonthlyPayment } from '@/utils/pricing';

interface AmortizationScheduleProps {
  offer: {
    apr: number;
    termYears: number;
    monthlyPayment: number;
  };
  principal: number;
  showFullSchedule?: boolean;
}

const AmortizationSchedule = forwardRef<HTMLDivElement, AmortizationScheduleProps>(
  ({ offer, principal, showFullSchedule = false }, ref) => {
  const schedule = useMemo(
    () =>
      calculateAmortizationSchedule(
        principal,
        offer.apr,
        offer.termYears,
        offer.monthlyPayment
      ),
    [principal, offer.apr, offer.termYears, offer.monthlyPayment]
  );

  const baselineFiveYearSchedule = useMemo(() => {
    const fiveYearMonthly = calculateMonthlyPayment(principal, offer.apr, 5);
    return calculateAmortizationSchedule(principal, offer.apr, 5, fiveYearMonthly);
  }, [principal, offer.apr]);

  const extraInterestVsFiveYear = useMemo(() => {
    return Math.max(0, schedule.totalInterest - baselineFiveYearSchedule.totalInterest);
  }, [schedule.totalInterest, baselineFiveYearSchedule.totalInterest]);

  // Show only first 12 months or all months
  const displayMonths = showFullSchedule
    ? schedule.months
    : schedule.months.slice(0, 12);

  return (
    <div ref={ref} className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Amortization Schedule
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
          <div>
            <p className="text-sm opacity-90">Principal</p>
            <p className="text-lg font-semibold">
              {formatCurrency(schedule.principal)}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Interest Rate</p>
            <p className="text-lg font-semibold">{offer.apr}% APR</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Term</p>
            <p className="text-lg font-semibold">{offer.termYears} years</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Monthly Payment</p>
            <p className="text-lg font-semibold">
              {formatCurrency(schedule.monthlyPayment)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 border-b bg-gray-50">
        <div>
          <p className="text-sm text-gray-600">Total Interest</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(schedule.totalInterest)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Amount Paid</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(schedule.totalPayment)}
          </p>
        </div>
        <div className="col-span-2 md:col-span-1">
          <p className="text-sm text-gray-600">Extra Interest vs 5-Year Term</p>
          <p className="text-lg font-semibold text-green-600">
            {offer.termYears > 5
              ? formatCurrency(extraInterestVsFiveYear)
              : formatCurrency(0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Month
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Payment Date
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Principal
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Interest
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Total Payment
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {displayMonths.map((month, idx) => (
              <tr
                key={month.month}
                className={
                  idx % 2 === 0
                    ? 'border-b bg-white hover:bg-gray-50'
                    : 'border-b bg-gray-50 hover:bg-gray-100'
                }
              >
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {month.month}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {formatDate(month.paymentDate)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatCurrency(month.principalPayment)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatCurrency(month.interestPayment)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(month.totalPayment)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">
                  {formatCurrency(month.remainingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Full Schedule Button */}
      {!showFullSchedule && displayMonths.length < schedule.months.length && (
        <div className="p-4 bg-gray-50 border-t text-center">
          <p className="text-sm text-gray-600">
            Showing first 12 months of {schedule.months.length} total payments
          </p>
        </div>
      )}
    </div>
  );
});

AmortizationSchedule.displayName = 'AmortizationSchedule';

export default AmortizationSchedule;
