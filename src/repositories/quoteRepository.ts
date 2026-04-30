import { prisma } from '@/lib/prisma';
import { Quote, Offer } from '@prisma/client';

export interface QuoteWithOffers extends Quote {
  offers: Offer[];
}

export class QuoteRepository {
  async create(
    userId: string,
    data: {
      fullName: string;
      address: string;
      monthlyConsumptionKwh: number;
      systemSizeKw: number;
      downPayment: number;
      systemPrice: number;
      principalAmount: number;
      riskBand: 'A' | 'B' | 'C';
    }
  ): Promise<QuoteWithOffers> {
    return prisma.quote.create({
      data: {
        userId,
        fullName: data.fullName,
        address: data.address,
        monthlyConsumptionKwh: data.monthlyConsumptionKwh,
        systemSizeKw: data.systemSizeKw,
        downPayment: data.downPayment,
        systemPrice: data.systemPrice,
        principalAmount: data.principalAmount,
        riskBand: data.riskBand,
      },
      include: { offers: true },
    });
  }

  async createOffers(
    quoteId: string,
    offers: Array<{
      termYears: number;
      apr: number;
      principalUsed: number;
      monthlyPayment: number;
    }>
  ): Promise<Offer[]> {
    const createdOffers = await Promise.all(
      offers.map((offer) =>
        prisma.offer.create({
          data: {
            quoteId,
            ...offer,
          },
        })
      )
    );
    return createdOffers;
  }

  async findById(quoteId: string): Promise<QuoteWithOffers | null> {
    return prisma.quote.findUnique({
      where: { id: quoteId },
      include: { offers: true },
    });
  }

  async findByIdAndUserId(
    quoteId: string,
    userId: string
  ): Promise<QuoteWithOffers | null> {
    return prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId,
      },
      include: { offers: true },
    });
  }

  async findByUserId(userId: string): Promise<QuoteWithOffers[]> {
    return prisma.quote.findMany({
      where: { userId },
      include: { offers: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<QuoteWithOffers[]> {
    return prisma.quote.findMany({
      include: { offers: true, user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findByUserEmail(email: string): Promise<QuoteWithOffers[]> {
    return prisma.quote.findMany({
      where: {
        user: {
          email: {
            contains: email,
          },
        },
      },
      include: { offers: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return prisma.quote.count();
  }

  async delete(quoteId: string): Promise<void> {
    // Cascade delete: remove offers first, then quote
    await prisma.offer.deleteMany({ where: { quoteId } });
    await prisma.quote.delete({ where: { id: quoteId } });
  }
}

export const quoteRepository = new QuoteRepository();
