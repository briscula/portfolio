import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CompanyDividendSummaryDto } from './dto/company-dividend-summary.dto';

import {
  DividendMonthlyChartResponseDto,
  DividendMonthlyChartDto,
} from './dto/dividend-monthly-chart.dto';
import { DividendAnalyticsQueryDto } from './dto/dividend-analytics-query.dto';

@Injectable()
export class DividendAnalyticsService {
  constructor(private prisma: PrismaService) {}

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

    // Add stock symbol filter if specified
    if (query.stockSymbol) {
      conditions.push(`t."stockSymbol" = $${paramIndex}`);
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
          t."stockSymbol",
          s."companyName",
          EXTRACT(YEAR FROM t."createdAt") as year,
          SUM(CASE WHEN t."type" = 'DIVIDEND' THEN t."cost" ELSE 0 END) as total_dividends,
          COUNT(CASE WHEN t."type" = 'DIVIDEND' THEN 1 END) as dividend_count,
          SUM(CASE WHEN t."type" = 'BUY' THEN t."cost" ELSE 0 END) as total_cost
        FROM "transaction" t
        LEFT JOIN "stock" s ON t."stockSymbol" = s."symbol"
        WHERE ${whereClause}
        GROUP BY t."stockSymbol", s."companyName", EXTRACT(YEAR FROM t."createdAt")
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
      stockSymbol: row.stockSymbol,
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
    conditions.push(`"portfolioId" IN (
      SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex}::uuid
    )`);
    params.push(userId);
    paramIndex++;

    // Add portfolio ID filter if specified
    if (query.portfolioId) {
      conditions.push(
        `"portfolioId" = $${paramIndex}::uuid AND "portfolioId" IN (
          SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex + 1}::uuid
        )`,
      );
      params.push(query.portfolioId);
      params.push(userId);
      paramIndex += 2;
    }

    // Add stock symbol filter if specified
    if (query.stockSymbol) {
      conditions.push(`"stockSymbol" = $${paramIndex}`);
      params.push(query.stockSymbol);
      paramIndex++;
    }

    // Add date range filters if specified
    if (query.startYear) {
      conditions.push(`"createdAt" >= $${paramIndex}`);
      params.push(new Date(query.startYear, 0, 1));
      paramIndex++;
    }

    if (query.endYear) {
      conditions.push(`"createdAt" <= $${paramIndex}`);
      params.push(new Date(query.endYear, 11, 31));
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const monthlyAggregates = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        EXTRACT(YEAR FROM "createdAt") as year,
        EXTRACT(MONTH FROM "createdAt") as month,
        TO_CHAR("createdAt", 'Month') as month_name,
        SUM("cost") as total_dividends,
        COUNT(*) as dividend_count,
        ARRAY_AGG(DISTINCT "stockSymbol") as companies
      FROM "transaction"
      WHERE ${whereClause}
      GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt"), TO_CHAR("createdAt", 'Month')
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
        companies: row.companies,
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
}
