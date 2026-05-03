import {
  calculateSystemPrice,
  calculateRiskBand,
  calculateMonthlyPayment,
  calculateOffers,
  calculatePricing,
} from '@/utils/pricing';

describe('Pricing Utilities', () => {
  describe('calculateSystemPrice', () => {
    it('should calculate system price correctly', () => {
      expect(calculateSystemPrice(5)).toBe(6000);
      expect(calculateSystemPrice(10)).toBe(12000);
      expect(calculateSystemPrice(3.5)).toBe(4200);
    });

    it('should handle zero system size', () => {
      expect(calculateSystemPrice(0)).toBe(0);
    });
  });

  describe('calculateRiskBand', () => {
    it('should assign Band A for high consumption and small system', () => {
      expect(calculateRiskBand(400, 6)).toBe('A');
      expect(calculateRiskBand(500, 5)).toBe('A');
      expect(calculateRiskBand(1000, 4)).toBe('A');
    });

    it('should not assign Band A if consumption is below 400', () => {
      expect(calculateRiskBand(399, 4)).toBe('B');
      expect(calculateRiskBand(200, 3)).toBe('C');
    });

    it('should not assign Band A if system size is above 6kW', () => {
      expect(calculateRiskBand(500, 7)).toBe('B');
      expect(calculateRiskBand(600, 10)).toBe('B');
    });

    it('should assign Band B for moderate consumption', () => {
      expect(calculateRiskBand(250, 8)).toBe('B');
      expect(calculateRiskBand(350, 10)).toBe('B');
      expect(calculateRiskBand(500, 10)).toBe('B');
    });

    it('should assign Band B even at minimum threshold', () => {
      expect(calculateRiskBand(250, 20)).toBe('B');
    });

    it('should assign Band C for low consumption', () => {
      expect(calculateRiskBand(100, 5)).toBe('C');
      expect(calculateRiskBand(200, 8)).toBe('C');
      expect(calculateRiskBand(249, 15)).toBe('C');
    });

    it('should handle edge cases at band boundaries', () => {
      // Edge case: exactly at 400 consumption, at or below 6kW system
      expect(calculateRiskBand(400, 6)).toBe('A');
      expect(calculateRiskBand(400, 6.1)).toBe('B');

      // Edge case: exactly at 250 consumption
      expect(calculateRiskBand(250, 10)).toBe('B');
      expect(calculateRiskBand(249.99, 10)).toBe('C');
    });
  });

  describe('calculateMonthlyPayment', () => {
    it('should calculate monthly payment correctly', () => {
      // Test case: $10,000 principal, 6.9% APR, 5 years
      const monthlyPayment = calculateMonthlyPayment(10000, 6.9, 5);
      expect(monthlyPayment).toBeCloseTo(197.54, 1);
    });

    it('should handle 0% APR', () => {
      // With 0% APR, monthly payment should be principal / months
      const monthlyPayment = calculateMonthlyPayment(12000, 0, 5);
      expect(monthlyPayment).toBeCloseTo(200, 0);
    });

    it('should handle 0 principal', () => {
      expect(calculateMonthlyPayment(0, 6.9, 5)).toBe(0);
    });

    it('should calculate higher payments for shorter terms', () => {
      const payment5Year = calculateMonthlyPayment(10000, 6.9, 5);
      const payment10Year = calculateMonthlyPayment(10000, 6.9, 10);
      const payment15Year = calculateMonthlyPayment(10000, 6.9, 15);

      expect(payment5Year).toBeGreaterThan(payment10Year);
      expect(payment10Year).toBeGreaterThan(payment15Year);
    });

    it('should calculate higher payments for higher APR', () => {
      const paymentA = calculateMonthlyPayment(10000, 6.9, 5);
      const paymentB = calculateMonthlyPayment(10000, 8.9, 5);
      const paymentC = calculateMonthlyPayment(10000, 11.9, 5);

      expect(paymentA).toBeLessThan(paymentB);
      expect(paymentB).toBeLessThan(paymentC);
    });

    // Detailed test cases based on amortization formula
    it('should match expected amortization values', () => {
      // Example: $6000 principal, 6.9% APR, 5 years
      // Monthly rate = 6.9 / 100 / 12 = 0.00575
      // Number of payments = 5 * 12 = 60
      // Expected monthly payment ≈ $118.52
      const payment = calculateMonthlyPayment(6000, 6.9, 5);
      expect(payment).toBeCloseTo(118.52, 1);
    });
  });

  describe('calculateOffers', () => {
    it('should generate offers for all terms', () => {
      const riskBand = 'A';
      const offers = calculateOffers(10000, riskBand);

      expect(offers).toHaveLength(3);
      expect(offers[0].termYears).toBe(5);
      expect(offers[1].termYears).toBe(10);
      expect(offers[2].termYears).toBe(15);
    });

    it('should assign correct APR by risk band', () => {
      const offersA = calculateOffers(10000, 'A');
      const offersB = calculateOffers(10000, 'B');
      const offersC = calculateOffers(10000, 'C');

      offersA.forEach((offer) => {
        expect(offer.apr).toBe(6.9);
      });

      offersB.forEach((offer) => {
        expect(offer.apr).toBe(8.9);
      });

      offersC.forEach((offer) => {
        expect(offer.apr).toBe(11.9);
      });
    });

    it('should include principal in each offer', () => {
      const principal = 10000;
      const offers = calculateOffers(principal, 'A');

      offers.forEach((offer) => {
        expect(offer.principalUsed).toBe(principal);
      });
    });

    it('should calculate monthly payment for each term', () => {
      const offers = calculateOffers(10000, 'A');

      offers.forEach((offer) => {
        expect(offer.monthlyPayment).toBeGreaterThan(0);
      });

      // 5-year term should have higher monthly payment than 10-year
      expect(offers[0].monthlyPayment).toBeGreaterThan(offers[1].monthlyPayment);
      // 10-year term should have higher monthly payment than 15-year
      expect(offers[1].monthlyPayment).toBeGreaterThan(offers[2].monthlyPayment);
    });
  });

  describe('calculatePricing', () => {
    it('should calculate complete pricing for a typical quote', () => {
      const pricing = calculatePricing({
        monthlyConsumptionKwh: 500,
        systemSizeKw: 5,
        downPayment: 1000,
      });

      expect(pricing.systemPrice).toBe(6000); // 5 * 1200
      expect(pricing.principalAmount).toBe(5000); // 6000 - 1000
      expect(pricing.riskBand).toBe('A');
      expect(pricing.offers).toHaveLength(3);
    });

    it('should handle down payment greater than system price', () => {
      const pricing = calculatePricing({
        monthlyConsumptionKwh: 500,
        systemSizeKw: 5,
        downPayment: 10000,
      });

      expect(pricing.systemPrice).toBe(6000);
      expect(pricing.principalAmount).toBe(0); // Principal cannot be negative
    });

    it('should calculate zero down payment scenario', () => {
      const pricing = calculatePricing({
        monthlyConsumptionKwh: 400,
        systemSizeKw: 6,
        downPayment: 0,
      });

      expect(pricing.systemPrice).toBe(7200);
      expect(pricing.principalAmount).toBe(7200);
      expect(pricing.riskBand).toBe('A');
    });

    it('should handle Band B scenario', () => {
      const pricing = calculatePricing({
        monthlyConsumptionKwh: 350,
        systemSizeKw: 8,
        downPayment: 500,
      });

      expect(pricing.systemPrice).toBe(9600);
      expect(pricing.riskBand).toBe('B');
      pricing.offers.forEach((offer) => {
        expect(offer.apr).toBe(8.9);
      });
    });

    it('should handle Band C scenario', () => {
      const pricing = calculatePricing({
        monthlyConsumptionKwh: 200,
        systemSizeKw: 10,
        downPayment: 0,
      });

      expect(pricing.systemPrice).toBe(12000);
      expect(pricing.riskBand).toBe('C');
      pricing.offers.forEach((offer) => {
        expect(offer.apr).toBe(11.9);
      });
    });

    it('should generate all three offers with monthly payment for large system', () => {
      const pricing = calculatePricing({
        monthlyConsumptionKwh: 800,
        systemSizeKw: 12,
        downPayment: 2000,
      });

      expect(pricing.offers.length).toBe(3);
      const [offer5, offer10, offer15] = pricing.offers;

      expect(offer5.termYears).toBe(5);
      expect(offer10.termYears).toBe(10);
      expect(offer15.termYears).toBe(15);

      expect(offer5.monthlyPayment).toBeGreaterThan(offer10.monthlyPayment);
      expect(offer10.monthlyPayment).toBeGreaterThan(offer15.monthlyPayment);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle realistic residential solar scenario', () => {
      // Typical residential user: 450 kWh/month, 5kW system, $2000 down
      const pricing = calculatePricing({
        monthlyConsumptionKwh: 450,
        systemSizeKw: 5,
        downPayment: 2000,
      });

      expect(pricing.systemPrice).toBe(6000);
      expect(pricing.principalAmount).toBe(4000);
      expect(pricing.riskBand).toBe('A');

      // Check that 5-year offer is reasonable
      const offer5 = pricing.offers.find((o) => o.termYears === 5);
      expect(offer5).toBeDefined();
      expect(offer5!.monthlyPayment).toBeGreaterThan(50);
      expect(offer5!.monthlyPayment).toBeLessThan(150);
    });

    it('should handle high-consumption scenario', () => {
      // High consumption: 1200 kWh/month, 10kW system, $0 down
      const pricing = calculatePricing({
        monthlyConsumptionKwh: 1200,
        systemSizeKw: 10,
        downPayment: 0,
      });

      expect(pricing.systemPrice).toBe(12000);
      expect(pricing.riskBand).toBe('B');
      expect(pricing.offers).toHaveLength(3);

      // All offers should be available
      pricing.offers.forEach((offer) => {
        expect(offer.apr).toBe(8.9);
        expect(offer.monthlyPayment).toBeGreaterThan(0);
      });
    });

    it('should handle minimum viable system', () => {
      const pricing = calculatePricing({
        monthlyConsumptionKwh: 100,
        systemSizeKw: 1,
        downPayment: 0,
      });

      expect(pricing.systemPrice).toBe(1200);
      expect(pricing.principalAmount).toBe(1200);
      expect(pricing.riskBand).toBe('C');

      const offer5 = pricing.offers.find((o) => o.termYears === 5);
      expect(offer5!.monthlyPayment).toBeGreaterThan(0);
    });
  });
});
