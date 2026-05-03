import { quoteRepository, QuoteWithOffers } from '@/repositories/quoteRepository';
import { calculatePricing, OfferResult, RiskBand } from '@/utils/pricing';
import { ValidationError } from '@/utils/errors';

export interface QuoteInput {
  fullName: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment?: number;
}

export interface QuoteResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment: number;
  systemPrice: number;
  principalAmount: number;
  riskBand: RiskBand;
  status: string;
  offers: OfferResult[];
  createdAt: Date;
  updatedAt: Date;
}

export class QuoteService {
  /**
   * Create a new quote with pricing calculation
   */
  async createQuote(userId: string, input: QuoteInput): Promise<QuoteResponse> {
    // Validate inputs
    if (!input.fullName || input.fullName.trim().length < 2) {
      throw new ValidationError('Full name must be at least 2 characters');
    }

    if (!input.address || input.address.trim().length < 5) {
      throw new ValidationError('Address must be at least 5 characters');
    }

    if (input.monthlyConsumptionKwh <= 0) {
      throw new ValidationError('Monthly consumption must be greater than 0');
    }

    if (input.systemSizeKw <= 0) {
      throw new ValidationError('System size must be greater than 0');
    }

    const downPayment = input.downPayment ?? 0;
    if (downPayment < 0) {
      throw new ValidationError('Down payment cannot be negative');
    }

    // Calculate pricing
    const pricing = calculatePricing({
      monthlyConsumptionKwh: input.monthlyConsumptionKwh,
      systemSizeKw: input.systemSizeKw,
      downPayment,
    });

    // Create quote in database
    const quote = await quoteRepository.create(userId, {
      fullName: input.fullName,
      address: input.address,
      monthlyConsumptionKwh: input.monthlyConsumptionKwh,
      systemSizeKw: input.systemSizeKw,
      downPayment,
      systemPrice: pricing.systemPrice,
      principalAmount: pricing.principalAmount,
      riskBand: pricing.riskBand,
    });

    // Create offers
    await quoteRepository.createOffers(quote.id, pricing.offers);

    // Fetch complete quote with offers
    const completeQuote = await quoteRepository.findById(quote.id);

    if (!completeQuote) {
      throw new Error('Failed to retrieve created quote');
    }

    return this.mapQuoteResponse(completeQuote);
  }

  /**
   * Get a quote by ID
   * Optionally enforce user ownership
   */
  async getQuote(quoteId: string, userId?: string): Promise<QuoteResponse> {
    let quote: QuoteWithOffers | null;

    if (userId) {
      quote = await quoteRepository.findByIdAndUserId(quoteId, userId);
    } else {
      quote = await quoteRepository.findById(quoteId);
    }

    if (!quote) {
      throw new ValidationError('Quote not found');
    }

    return this.mapQuoteResponse(quote);
  }

  /**
   * Get all quotes for a user
   */
  async getUserQuotes(userId: string): Promise<QuoteResponse[]> {
    const quotes = await quoteRepository.findByUserId(userId);
    return quotes.map((q) => this.mapQuoteResponse(q));
  }

  /**
   * Get all quotes (admin only)
   */
  async getAllQuotes(limit: number = 50, offset: number = 0): Promise<QuoteResponse[]> {
    const quotes = await quoteRepository.findAll(limit, offset);
    return quotes.map((q) => this.mapQuoteResponse(q));
  }

  /**
   * Search quotes by user email (admin only)
   */
  async searchQuotesByEmail(email: string): Promise<QuoteResponse[]> {
    const quotes = await quoteRepository.findByUserEmail(email);
    return quotes.map((q) => this.mapQuoteResponse(q));
  }

  /**
   * Map database quote to response DTO
   */
  private mapQuoteResponse(quote: QuoteWithOffers): QuoteResponse {
    return {
      id: quote.id,
      userId: quote.userId,
      fullName: quote.fullName,
      email: (quote as any).user?.email || 'N/A',
      address: quote.address,
      monthlyConsumptionKwh: quote.monthlyConsumptionKwh,
      systemSizeKw: quote.systemSizeKw,
      downPayment: quote.downPayment ?? 0,
      systemPrice: quote.systemPrice,
      principalAmount: quote.principalAmount,
      riskBand: quote.riskBand as RiskBand,
      status: (quote as any).status || 'pending',
      offers: quote.offers.map((o) => ({
        termYears: o.termYears,
        apr: o.apr,
        principalUsed: o.principalUsed,
        monthlyPayment: o.monthlyPayment,
      })),
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    };
  }
}

export const quoteService = new QuoteService();
