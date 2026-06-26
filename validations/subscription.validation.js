import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().min(0),
  currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  category: z.enum(['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'other']),
  paymentMethod: z.string().min(1),
  startDate: z.string().datetime(), 
});