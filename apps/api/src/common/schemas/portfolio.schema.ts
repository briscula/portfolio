import { z } from 'zod';

/**
 * Schema for creating a new portfolio
 */
export const CreatePortfolioSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    description: z.string().optional(),
    currencyCode: z.string().length(3, 'Currency code must be exactly 3 characters').toUpperCase(),
});

export type CreatePortfolioDto = z.infer<typeof CreatePortfolioSchema>;

/**
 * Schema for updating a portfolio
 */
export const UpdatePortfolioSchema = CreatePortfolioSchema.partial();

export type UpdatePortfolioDto = z.infer<typeof UpdatePortfolioSchema>;

/**
 * Schema for currency information
 */
export const CurrencySchema = z.object({
    code: z.string().length(3),
    name: z.string(),
    symbol: z.string(),
});

export type CurrencyDto = z.infer<typeof CurrencySchema>;

/**
 * Schema for portfolio response (from database)
 */
export const PortfolioSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    currencyCode: z.string(),
    userId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

/**
 * Schema for portfolio with currency details
 */
export const PortfolioWithCurrencySchema = PortfolioSchema.extend({
    currency: CurrencySchema,
});

export type PortfolioWithCurrency = z.infer<typeof PortfolioWithCurrencySchema>;
