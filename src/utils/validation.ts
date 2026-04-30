import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Quote schemas
export const quoteInputSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  address: z.string().min(5, 'Address is required'),
  monthlyConsumptionKwh: z
    .number()
    .positive('Monthly consumption must be positive')
    .min(100, 'Monthly consumption must be at least 100 kWh'),
  systemSizeKw: z
    .number()
    .positive('System size must be positive')
    .min(1, 'System size must be at least 1 kW'),
  downPayment: z.number().positive('Down payment must be positive').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type QuoteInput = z.infer<typeof quoteInputSchema>;
