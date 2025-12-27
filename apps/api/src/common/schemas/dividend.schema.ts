import { z } from 'zod';

/**
 * Schema for dividend analytics query parameters
 */
export const DividendAnalyticsQuerySchema = z
  .object({
    startYear: z.coerce.number().int().min(1900).max(2100),
    endYear: z.coerce.number().int().min(1900).max(2100),
    portfolioId: z.string().uuid().optional(),
    stockSymbol: z.string().optional(),
  })
  .refine((data) => data.endYear >= data.startYear, {
    message: 'End year must be greater than or equal to start year',
    path: ['endYear'],
  });

export type DividendAnalyticsQueryDto = z.infer<
  typeof DividendAnalyticsQuerySchema
>;

/**
 * Schema for company dividend summary
 */
export const CompanyDividendSummarySchema = z.object({
  stockSymbol: z.string(),
  companyName: z.string(),
  year: z.number().int(),
  totalDividends: z.number(),
  dividendCount: z.number().int(),
  totalCost: z.number(),
  yieldOnCost: z.number(),
  averageDividendPerPayment: z.number(),
});

export type CompanyDividendSummary = z.infer<
  typeof CompanyDividendSummarySchema
>;

/**
 * Schema for monthly data point
 */
export const MonthlyDataPointSchema = z.object({
  year: z.string(),
  totalDividends: z.number(),
  dividendCount: z.number(),
  companies: z.array(z.string()),
});

export type MonthlyDataPoint = z.infer<typeof MonthlyDataPointSchema>;

/**
 * Schema for dividend monthly chart
 */
export const DividendMonthlyChartSchema = z.object({
  month: z.string(),
  monthName: z.string(),
  yearlyData: z.array(MonthlyDataPointSchema),
});

export type DividendMonthlyChart = z.infer<typeof DividendMonthlyChartSchema>;

/**
 * Schema for dividend monthly chart response
 */
export const DividendMonthlyChartResponseSchema = z.object({
  months: z.array(z.string()),
  years: z.array(z.string()),
  data: z.array(DividendMonthlyChartSchema),
});

export type DividendMonthlyChartResponse = z.infer<
  typeof DividendMonthlyChartResponseSchema
>;
