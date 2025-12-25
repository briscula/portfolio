import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CompanyDividendSummaryDto } from './dto/company-dividend-summary.dto';

import {
  DividendMonthlyChartResponseDto,
  DividendMonthlyChartDto,
} from './dto/dividend-monthly-chart.dto';
import { DividendAnalyticsQueryDto } from './dto/dividend-analytics-query.dto';
import { DividendSummaryDto } from './dto/dividend-summary.dto';
import { HoldingsYieldComparisonResponseDto } from './dto/holdings-yield-comparison.dto';

@Injectable()
export class DividendAnalyticsService {
  constructor(private prisma: PrismaService) { }

  async getCompanyDividendSummaries(
    userId: string,
    query: DividendAnalyticsQueryDto,
  ): Promise<CompanyDividendSummaryDto[]> {
    // Build SQL WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Add portfolio filter
    conditions.push(`t."portfolioId" IN (
      SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex}::uuid
    )`);
    params.push(userId);
    paramIndex++;

    // Add portfolio ID filter if specified
    if (query.portfolioId) {
      conditions.push(
        `t."portfolioId" = $${paramIndex}::uuid AND t."portfolioId" IN (
          SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex + 1}::uuid
        )`,
      );
      params.push(query.portfolioId);
      params.push(userId);
      paramIndex += 2;
    }

    // Add stock symbol filter if specified (now listing tickerSymbol)
    if (query.stockSymbol) {
      conditions.push(`l."tickerSymbol" = $${paramIndex}`);
      params.push(query.stockSymbol);
      paramIndex++;
    }

    // Add date range filters if specified
    if (query.startYear) {
      conditions.push(`t."createdAt" >= $${paramIndex}`);
      params.push(new Date(query.startYear, 0, 1));
      paramIndex++;
    }

    if (query.endYear) {
      conditions.push(`t."createdAt" <= $${paramIndex}`);
      params.push(new Date(query.endYear, 11, 31));
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? conditions.join(' AND ') : '1=1';

    const companySummaries = await this.prisma.$queryRawUnsafe<any[]>(
      `WITH dividend_data AS (
        SELECT 
          l."tickerSymbol" as stockSymbol,
          l."companyName",
          EXTRACT(YEAR FROM t."createdAt") as year,
          SUM(CASE WHEN t."type" = 'DIVIDEND' THEN t."amount" ELSE 0 END) as total_dividends,
          COUNT(CASE WHEN t."type" = 'DIVIDEND' THEN 1 END) as dividend_count,
          SUM(CASE WHEN t."type" = 'BUY' THEN t."amount" ELSE 0 END) as total_cost
        FROM "transaction" t
        LEFT JOIN "listing" l ON t."listingIsin" = l."isin" AND t."listingExchangeCode" = l."exchangeCode"
        WHERE ${whereClause}
        GROUP BY l."tickerSymbol", l."companyName", EXTRACT(YEAR FROM t."createdAt")
        HAVING COUNT(CASE WHEN t."type" = 'DIVIDEND' THEN 1 END) > 0
      )
      SELECT 
        "stockSymbol",
        "companyName",
        "year",
        "total_dividends",
        "dividend_count",
        "total_cost",
        CASE 
          WHEN "total_cost" > 0 THEN ("total_dividends" / "total_cost") * 100
          ELSE 0 
        END as yield_on_cost,
        CASE 
          WHEN "dividend_count" > 0 THEN "total_dividends" / "dividend_count"
          ELSE 0 
        END as avg_dividend_per_payment
      FROM dividend_data
      ORDER BY "stockSymbol", "year" DESC`,
      ...params,
    );

    return companySummaries.map((row: any) => ({
      stockSymbol: row.stockSymbol, // Now tickerSymbol
      companyName: row.companyName || row.stockSymbol,
      year: parseInt(row.year),
      totalDividends: parseFloat(row.total_dividends),
      dividendCount: parseInt(row.dividend_count),
      totalCost: parseFloat(row.total_cost),
      yieldOnCost: parseFloat(row.yield_on_cost),
      averageDividendPerPayment: parseFloat(row.avg_dividend_per_payment),
    }));
  }

  async getMonthlyDividendOverview(
    userId: string,
    query: DividendAnalyticsQueryDto,
  ): Promise<DividendMonthlyChartResponseDto> {
    // Build SQL WHERE conditions
    const conditions: string[] = [`"type" = 'DIVIDEND'`];
    const params: any[] = [];
    let paramIndex = 1;

    // Add portfolio filter
    conditions.push(`t."portfolioId" IN (
      SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex}::uuid
    )`);
    params.push(userId);
    paramIndex++;

    // Add portfolio ID filter if specified
    if (query.portfolioId) {
      conditions.push(
        `t."portfolioId" = $${paramIndex}::uuid AND t."portfolioId" IN (
          SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex + 1}::uuid
        )`,
      );
      params.push(query.portfolioId);
      params.push(userId);
      paramIndex += 2;
    }

    // Add stock symbol filter if specified (now listing tickerSymbol)
    if (query.stockSymbol) {
      conditions.push(`l."tickerSymbol" = $${paramIndex}`);
      params.push(query.stockSymbol);
      paramIndex++;
    }

    // Add date range filters if specified
    if (query.startYear) {
      conditions.push(`t."createdAt" >= $${paramIndex}`);
      params.push(new Date(query.startYear, 0, 1));
      paramIndex++;
    }

    if (query.endYear) {
      conditions.push(`t."createdAt" <= $${paramIndex}`);
      params.push(new Date(query.endYear, 11, 31));
      paramIndex++;
    }

    const joinClause = 'LEFT JOIN "listing" l ON t."listingIsin" = l."isin" AND t."listingExchangeCode" = l."exchangeCode"';
    const whereClause = conditions.join(' AND ');


    const monthlyAggregates = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        EXTRACT(YEAR FROM t."createdAt") as year,
        EXTRACT(MONTH FROM t."createdAt") as month,
        TO_CHAR(t."createdAt", 'Month') as month_name,
        SUM(t."amount") as total_dividends,
        COUNT(l."tickerSymbol") as dividend_count,
        ARRAY_AGG(DISTINCT l."tickerSymbol") as companies
      FROM "transaction" t
      ${joinClause}
      WHERE ${whereClause}
      GROUP BY EXTRACT(YEAR FROM t."createdAt"), EXTRACT(MONTH FROM t."createdAt"), TO_CHAR(t."createdAt", 'Month')
      ORDER BY year DESC, month DESC`,
      ...params,
    );

    // Group by month and create chart data
    const monthGroups = new Map<string, any[]>();

    monthlyAggregates.forEach((row: any) => {
      const monthKey = row.month.toString().padStart(2, '0');
      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, []);
      }
      monthGroups.get(monthKey)!.push({
        year: row.year.toString(),
        totalDividends: parseFloat(row.total_dividends),
        dividendCount: parseInt(row.dividend_count),
        companies: row.companies, // companies now contains tickerSymbols
      });
    });

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Get all unique years
    const years = [
      ...new Set(monthlyAggregates.map((row: any) => row.year.toString())),
    ].sort();

    // Generate complete month range for all years
    const allMonths = [];
    for (let month = 1; month <= 12; month++) {
      const monthKey = month.toString().padStart(2, '0');
      const monthIndex = month - 1;

      // Create yearly data for this month across all years
      const yearlyData = years.map(year => {
        // Check if we have data for this month/year combination
        const existingData = monthGroups.get(monthKey)?.find(data => data.year === year);

        if (existingData) {
          return existingData;
        } else {
          // Fill with zero values for months without dividends
          return {
            year,
            totalDividends: 0,
            dividendCount: 0,
            companies: [],
          };
        }
      });

      allMonths.push({
        month: monthKey,
        monthName: monthNames[monthIndex],
        yearlyData: yearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year)),
      });
    }

    return {
      months: monthNames,
      years,
      data: allMonths,
    };
  }

  /**
   * Get dividend summary for a portfolio
   * Calculates total dividends, yield, and average monthly dividends for last 12 months
   */
  async getDividendSummary(
    userId: string,
    portfolioId: string,
    period: 'last12Months' | 'allTime' = 'last12Months',
  ): Promise<DividendSummaryDto> {
    // Verify portfolio belongs to user
    const portfolio = await this.prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: userId,
      },
    });

    if (!portfolio) {
      throw new Error('Portfolio not found or access denied.');
    }

    // Calculate date range for last 12 months
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    // Build WHERE clause based on period
    const dateFilter = period === 'last12Months'
      ? { createdAt: { gte: twelveMonthsAgo } }
      : {};

    // Get total dividends for the period
    const dividendResult = await this.prisma.transaction.aggregate({
      where: {
        portfolioId,
        type: 'DIVIDEND',
        ...dateFilter,
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const totalDividends = Math.abs(dividendResult._sum.amount || 0);
    const dividendCount = dividendResult._count || 0;

    // Get total cost of dividend-paying positions
    // We need to identify which stocks paid dividends and sum their costs
    const dividendPayingListings = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'],
      where: {
        portfolioId,
        type: 'DIVIDEND',
        ...dateFilter,
      },
    });

    const listingIdentifiers = dividendPayingListings.map(d => ({
        isin: d.listingIsin,
        exchangeCode: d.listingExchangeCode,
    }));

    // Calculate total cost for these stocks
    let totalCost = 0;
    if (listingIdentifiers.length > 0) {
      const positions = await this.prisma.transaction.groupBy({
        by: ['listingIsin', 'listingExchangeCode'],
        where: {
          portfolioId,
          OR: listingIdentifiers.map(id => ({
              listingIsin: id.isin,
              listingExchangeCode: id.exchangeCode,
          })),
          type: { in: ['BUY', 'SELL'] },
        },
        _sum: {
          amount: true,
          quantity: true,
        },
      });

      // Sum up costs for positions with current holdings
      totalCost = positions
        .filter(p => (p._sum.quantity || 0) > 0)
        .reduce((sum, p) => sum + Math.abs(p._sum.amount || 0), 0);
    }

    // Calculate metrics
    const dividendYield = totalCost > 0 ? (totalDividends / totalCost) * 100 : 0;
    const monthsInPeriod = period === 'last12Months' ? 12 : (dividendCount > 0 ? 12 : 1);
    const avgMonthlyDividends = totalDividends / monthsInPeriod;

    return {
      totalDividends: parseFloat(totalDividends.toFixed(2)),
      dividendYield: parseFloat(dividendYield.toFixed(2)),
      avgMonthlyDividends: parseFloat(avgMonthlyDividends.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      dividendCount,
      period,
    };
  }

  /**
   * Get holdings yield comparison data for portfolio
   * Compares Yield on Cost vs Trailing 12-Month Yield for each holding
   */
  async getHoldingsYieldComparison(
    userId: string,
    portfolioId: string,
  ): Promise<HoldingsYieldComparisonResponseDto> {
    // Verify portfolio ownership
    const portfolio = await this.prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new Error('Portfolio not found or access denied.');
    }

    // Calculate date for 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    console.log('[DEBUG] Querying holdings for:', { userId, portfolioId, twelveMonthsAgo });

    // Calculate positions directly from transactions instead of user_positions
    const holdingsData = await this.prisma.$queryRawUnsafe<any[]>(
      `
      WITH position_calc AS (
        -- Calculate current positions from BUY/SELL transactions
        SELECT
          t."listingIsin",
          t."listingExchangeCode",
          l."tickerSymbol" as "stockSymbol",
          l."companyName",
          SUM(CASE
            WHEN t."type" = 'BUY' THEN t."quantity"
            WHEN t."type" = 'SELL' THEN -t."quantity"
            ELSE 0
          END) as "currentQuantity",
          -- Total amount spent on BUY transactions
          SUM(CASE WHEN t."type" = 'BUY' THEN ABS(t."amount") ELSE 0 END) as "totalBuyAmount",
          -- Total quantity bought
          SUM(CASE WHEN t."type" = 'BUY' THEN t."quantity" ELSE 0 END) as "totalBuyQuantity",
          SUM(CASE
            WHEN t."type" = 'DIVIDEND' THEN ABS(t."amount")
            ELSE 0
          END) as "totalDividends",
          COUNT(CASE WHEN t."type" = 'DIVIDEND' THEN 1 END) as "dividendCount"
        FROM "transaction" t
        INNER JOIN "listing" l ON
          l."isin" = t."listingIsin" AND
          l."exchangeCode" = t."listingExchangeCode"
        WHERE t."portfolioId" = $2::uuid
        GROUP BY t."listingIsin", t."listingExchangeCode", l."tickerSymbol", l."companyName"
        HAVING SUM(CASE
          WHEN t."type" = 'BUY' THEN t."quantity"
          WHEN t."type" = 'SELL' THEN -t."quantity"
          ELSE 0
        END) > 0
        AND SUM(CASE WHEN t."type" = 'DIVIDEND' THEN ABS(t."amount") ELSE 0 END) > 0
      )
      SELECT
        h."stockSymbol",
        h."companyName",
        h."currentQuantity",
        -- Calculate cost basis using average cost method: (avg cost per share) * current quantity
        CASE
          WHEN h."totalBuyQuantity" > 0 THEN (h."totalBuyAmount" / h."totalBuyQuantity") * h."currentQuantity"
          ELSE 0
        END as "totalCost",
        h."totalDividends",
        h."listingIsin",
        h."listingExchangeCode",
        COALESCE(
          (SELECT SUM(ABS(t."amount"))
           FROM "transaction" t
           WHERE t."portfolioId" = $2::uuid
             AND t."listingIsin" = h."listingIsin"
             AND t."listingExchangeCode" = h."listingExchangeCode"
             AND t."type" = 'DIVIDEND'
             AND t."createdAt" >= $3),
          0
        ) as trailing_total,
        l."currentPrice" as current_price,
        l."currencyCode",
        l."priceLastUpdated" as price_last_updated
      FROM position_calc h
      LEFT JOIN "listing" l ON
        h."listingIsin" = l."isin" AND
        h."listingExchangeCode" = l."exchangeCode"
      ORDER BY h."totalDividends" DESC
      `,
      userId,
      portfolioId,
      twelveMonthsAgo,
    );

    console.log('[DEBUG] Holdings calculated from transactions:', holdingsData.length, 'rows');
    if (holdingsData.length > 0) {
      console.log('[DEBUG] First holding:', holdingsData[0]);
    }

    console.log('[DEBUG] Holdings data returned:', holdingsData.length, 'rows');
    if (holdingsData.length > 0) {
      console.log('[DEBUG] First row:', holdingsData[0]);
    }

    // Transform data and calculate metrics
    const holdings = holdingsData.map((row) => {
      const currentQuantity = parseFloat(row.currentQuantity);
      const currentPrice = row.current_price ? parseFloat(row.current_price) : 0;
      const totalCost = Math.abs(parseFloat(row.totalCost));
      const totalDividends = Math.abs(parseFloat(row.totalDividends));
      const trailing12MonthDividends = Math.abs(parseFloat(row.trailing_total || 0));

      // Calculate Yield on Cost (using last 12 months dividends / original cost)
      const yieldOnCost = totalCost > 0 ? (trailing12MonthDividends / totalCost) * 100 : 0;

      // Calculate Trailing 12-Month Yield (requires current price)
      const currentValue = currentQuantity * currentPrice;
      const trailing12MonthYield = currentValue > 0
        ? (trailing12MonthDividends / currentValue) * 100
        : 0;

      return {
        tickerSymbol: row.stockSymbol,
        companyName: row.companyName || row.stockSymbol,
        currentQuantity,
        currentPrice,
        currencyCode: row.currencyCode || 'USD',
        yieldOnCost: parseFloat(yieldOnCost.toFixed(2)),
        trailing12MonthYield: parseFloat(trailing12MonthYield.toFixed(2)),
        trailing12MonthDividends: parseFloat(trailing12MonthDividends.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalDividends: parseFloat(totalDividends.toFixed(2)),
      };
    });

    // Get the most recent price update timestamp
    const lastPriceUpdate = holdingsData.length > 0
      ? new Date(holdingsData[0].price_last_updated)
      : new Date();

    return {
      holdings,
      lastPriceUpdate,
    };
  }
}
