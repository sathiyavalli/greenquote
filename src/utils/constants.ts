export const PRICING_CONFIG = {
  SYSTEM_PRICE_PER_KW: 1200,
  TERMS: [5, 10, 15],
  RISK_BANDS: {
    A: {
      condition: (consumption: number, size: number) =>
        consumption >= 400 && size <= 6,
      apr: 0.069,
    },
    B: {
      condition: (consumption: number) => consumption >= 250,
      apr: 0.089,
    },
    C: {
      condition: () => true,
      apr: 0.119,
    },
  },
};

export const API_RESPONSE = {
  SUCCESS: 'success',
  ERROR: 'error',
};
