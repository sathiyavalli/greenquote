import { calculateAmortizationSchedule } from '@/utils/amortization';

describe('Amortization Schedule', () => {
  it('should calculate correct amortization schedule for 5-year term', () => {
    const principal = 10000;
    const apr = 8.9;
    const termYears = 5;
    const monthlyPayment = 202.46;

    const schedule = calculateAmortizationSchedule(principal, apr, termYears, monthlyPayment);

    // Verify schedule properties
    expect(schedule.principal).toBe(principal);
    expect(schedule.apr).toBe(apr);
    expect(schedule.termYears).toBe(termYears);
    expect(schedule.monthlyPayment).toBe(monthlyPayment);
    expect(schedule.months.length).toBe(60); // 5 years * 12 months

    // Verify first month
    const firstMonth = schedule.months[0];
    expect(firstMonth.month).toBe(1);
    expect(firstMonth.principalPayment).toBeGreaterThan(0);
    expect(firstMonth.interestPayment).toBeGreaterThan(0);
    expect(firstMonth.totalPayment).toBeCloseTo(monthlyPayment, 0);

    // Verify last month closes exactly after cent-based rounding adjustment
    const lastMonth = schedule.months[59];
    expect(lastMonth.remainingBalance).toBe(0);

    // Verify total interest calculation
    expect(schedule.totalInterest).toBeGreaterThan(0);
    expect(schedule.totalPayment).toBeCloseTo(principal + schedule.totalInterest, 0);
  });

  it('should handle zero interest rate', () => {
    const principal = 10000;
    const apr = 0;
    const termYears = 5;
    const monthlyPayment = principal / (termYears * 12); // 166.67

    const schedule = calculateAmortizationSchedule(principal, apr, termYears, monthlyPayment);

    expect(schedule.totalInterest).toBe(0);
    expect(schedule.months[0].interestPayment).toBe(0);
    expect(schedule.months[0].principalPayment).toBeCloseTo(monthlyPayment, 0);
  });

  it('should calculate correct schedule for 10-year term with higher APR', () => {
    const principal = 15000;
    const apr = 11.9;
    const termYears = 10;
    const monthlyPayment = 188.92;

    const schedule = calculateAmortizationSchedule(principal, apr, termYears, monthlyPayment);

    expect(schedule.months.length).toBe(120); // 10 years * 12 months
    expect(schedule.totalInterest).toBeGreaterThan(
      calculateAmortizationSchedule(principal, 8.9, termYears, 188.92).totalInterest
    );
  });

  it('should maintain consistent monthly payments', () => {
    const principal = 20000;
    const apr = 8.9;
    const termYears = 15;
    const monthlyPayment = 192.55;

    const schedule = calculateAmortizationSchedule(principal, apr, termYears, monthlyPayment);

    // All regular payments should be consistent; last payment can be adjusted by cents.
    const regularPayments = schedule.months.slice(0, -1);
    regularPayments.forEach((month) => {
      expect(month.totalPayment).toBeCloseTo(monthlyPayment, 2);
    });

    const lastPayment = schedule.months[schedule.months.length - 1].totalPayment;
    expect(lastPayment).toBeGreaterThan(0);
    expect(schedule.months[schedule.months.length - 1].remainingBalance).toBe(0);
  });

  it('should keep totals mathematically consistent after rounding', () => {
    const principal = 3000;
    const apr = 8.9;
    const termYears = 15;
    const monthlyRate = apr / 100 / 12;
    const numberOfPayments = termYears * 12;
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const schedule = calculateAmortizationSchedule(principal, apr, termYears, monthlyPayment);

    const totalPaymentsFromRows = schedule.months.reduce((sum, m) => sum + m.totalPayment, 0);
    const totalInterestFromRows = schedule.months.reduce((sum, m) => sum + m.interestPayment, 0);

    expect(schedule.totalPayment).toBeCloseTo(totalPaymentsFromRows, 2);
    expect(schedule.totalInterest).toBeCloseTo(totalInterestFromRows, 2);
    expect(schedule.months[schedule.months.length - 1].remainingBalance).toBe(0);
  });

  it('should have decreasing interest payments over time', () => {
    const principal = 25000;
    const apr = 8.9;
    const termYears = 5;
    const monthlyPayment = 506.15;

    const schedule = calculateAmortizationSchedule(principal, apr, termYears, monthlyPayment);

    // Interest payment should decrease over time
    const firstMonthInterest = schedule.months[0].interestPayment;
    const lastMonthInterest = schedule.months[59].interestPayment;

    expect(lastMonthInterest).toBeLessThan(firstMonthInterest);
  });

  it('should have increasing principal payments over time', () => {
    const principal = 25000;
    const apr = 8.9;
    const termYears = 5;
    const monthlyPayment = 506.15;

    const schedule = calculateAmortizationSchedule(principal, apr, termYears, monthlyPayment);

    // Principal payment should increase over time
    const firstMonthPrincipal = schedule.months[0].principalPayment;
    const lastMonthPrincipal = schedule.months[59].principalPayment;

    expect(lastMonthPrincipal).toBeGreaterThan(firstMonthPrincipal);
  });
});
