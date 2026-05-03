/**
 * Amortization schedule utilities for GreenQuote
 * Generates detailed month-by-month payment breakdown for loans
 */

export interface AmortizationMonth {
  month: number;
  paymentDate: string; // ISO date string
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface AmortizationSchedule {
  principal: number;
  apr: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  months: AmortizationMonth[];
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate detailed amortization schedule for a loan
 *
 * @param principal - Principal amount to be financed
 * @param apr - Annual interest rate (percentage)
 * @param termYears - Loan term in years
 * @param monthlyPayment - Monthly payment amount
 * @param startDate - Start date for amortization (defaults to today)
 * @returns Detailed amortization schedule with month-by-month breakdown
 */
export function calculateAmortizationSchedule(
  principal: number,
  apr: number,
  termYears: number,
  monthlyPayment: number,
  startDate: Date = new Date()
): AmortizationSchedule {
  const monthlyRate = apr / 100 / 12;
  const numberOfPayments = termYears * 12;
  const regularMonthlyPayment = roundToCents(monthlyPayment);

  const months: AmortizationMonth[] = [];
  let remainingBalance = roundToCents(principal);
  let totalInterest = 0;
  let totalPayment = 0;

  for (let month = 1; month <= numberOfPayments; month++) {
    // Calculate each month using currency rounding to prevent drift across long terms.
    const interestPayment = roundToCents(remainingBalance * monthlyRate);
    let principalPayment = roundToCents(regularMonthlyPayment - interestPayment);
    let totalPaymentForMonth = regularMonthlyPayment;

    // Last payment is adjusted so remaining balance is exactly zero after rounding.
    if (month === numberOfPayments || principalPayment > remainingBalance) {
      principalPayment = remainingBalance;
      totalPaymentForMonth = roundToCents(principalPayment + interestPayment);
    }

    if (principalPayment < 0) {
      principalPayment = 0;
      totalPaymentForMonth = roundToCents(interestPayment);
    }

    remainingBalance = roundToCents(remainingBalance - principalPayment);
    if (remainingBalance < 0) {
      remainingBalance = 0;
    }

    // Calculate payment date
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    totalInterest = roundToCents(totalInterest + interestPayment);
    totalPayment = roundToCents(totalPayment + totalPaymentForMonth);

    months.push({
      month,
      paymentDate: paymentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      principalPayment,
      interestPayment,
      totalPayment: totalPaymentForMonth,
      remainingBalance,
    });
  }

  return {
    principal: roundToCents(principal),
    apr,
    termYears,
    monthlyPayment: regularMonthlyPayment,
    totalInterest,
    totalPayment,
    months,
  };
}

/**
 * Format currency value for display (Euro)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
