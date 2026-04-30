/**
 * Pricing utilities for GreenQuote
 * Handles system pricing, risk band calculation, and amortization
 */

export interface PricingInput {
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment: number;
}

export type RiskBand = 'A' | 'B' | 'C';

export interface PricingResult {
  systemPrice: number;
  principalAmount: number;
  riskBand: RiskBand;
  offers: OfferResult[];
}

export interface OfferResult {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
}

const SYSTEM_PRICE_PER_KW = 1200;

const RISK_BAND_APR: Record<RiskBand, number> = {
  A: 6.9,
  B: 8.9,
  C: 11.9,
};

const OFFER_TERMS = [5, 10, 15];

/**
 * Calculate system price based on system size
 */
export function calculateSystemPrice(systemSizeKw: number): number {
  return systemSizeKw * SYSTEM_PRICE_PER_KW;
}

/**
 * Determine risk band based on consumption and system size
 *
 * Band A: consumption >= 400 kWh/month AND system <= 6 kW
 * Band B: consumption >= 250 kWh/month (if not A)
 * Band C: otherwise (consumption < 250 kWh/month)
 */
export function calculateRiskBand(
  monthlyConsumptionKwh: number,
  systemSizeKw: number
): RiskBand {
  if (monthlyConsumptionKwh >= 400 && systemSizeKw <= 6) {
    return 'A';
  }
  if (monthlyConsumptionKwh >= 250) {
    return 'B';
  }
  return 'C';
}

/**
 * Calculate monthly payment using standard amortization formula
 *
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Where:
 * - M = Monthly payment
 * - P = Principal amount
 * - r = Monthly interest rate (annual APR / 100 / 12)
 * - n = Total number of payments (years * 12)
 */
export function calculateMonthlyPayment(
  principalAmount: number,
  annualApr: number,
  termYears: number
): number {
  if (principalAmount <= 0) {
    return 0;
  }

  const monthlyRate = annualApr / 100 / 12;
  const numberOfPayments = termYears * 12;

  // Avoid division by zero for 0% APR
  if (monthlyRate === 0) {
    return principalAmount / numberOfPayments;
  }

  const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
  const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;

  return (principalAmount * numerator) / denominator;
}

/**
 * Calculate all offers for a quote
 */
export function calculateOffers(
  principalAmount: number,
  riskBand: RiskBand
): OfferResult[] {
  const apr = RISK_BAND_APR[riskBand];

  return OFFER_TERMS.map((termYears) => ({
    termYears,
    apr,
    principalUsed: principalAmount,
    monthlyPayment: calculateMonthlyPayment(principalAmount, apr, termYears),
  }));
}

/**
 * Full pricing calculation
 */
export function calculatePricing(input: PricingInput): PricingResult {
  const systemPrice = calculateSystemPrice(input.systemSizeKw);
  const principalAmount = Math.max(0, systemPrice - input.downPayment);
  const riskBand = calculateRiskBand(input.monthlyConsumptionKwh, input.systemSizeKw);
  const offers = calculateOffers(principalAmount, riskBand);

  return {
    systemPrice,
    principalAmount,
    riskBand,
    offers,
  };
}
