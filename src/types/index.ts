export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Quote {
  id: string;
  userId: string;
  fullName: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment?: number;
  systemPrice: number;
  principalAmount: number;
  riskBand: 'A' | 'B' | 'C';
  offers: Offer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  quoteId: string;
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
}

export interface AuthToken {
  token: string;
  user: User;
}

export interface QuoteResult {
  id: string;
  systemPrice: number;
  principalAmount: number;
  riskBand: 'A' | 'B' | 'C';
  offers: Offer[];
}
