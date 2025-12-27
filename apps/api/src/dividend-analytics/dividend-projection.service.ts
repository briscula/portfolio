import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@repo/database';

type DividendFrequency = $Enums.DividendFrequency;

interface ProjectedDividend {
  tickerSymbol: string;
  companyName: string | null;
  amount: number;
  source: 'EXTERNAL_API' | 'HISTORICAL_PATTERN';
}

interface MonthlyProjection {
  month: string; // YYYY-MM format
  totalProjected: number;
  holdings: ProjectedDividend[];
}

interface ProjectionSummary {
  total12MonthProjection: number;
  avgMonthlyProjection: number;
}

export interface DividendProjectionsResponse {
  projections: MonthlyProjection[];
  summary: ProjectionSummary;
}

@Injectable()
export class DividendProjectionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate 12-month dividend projections for a portfolio
   */
  async getProjections(
    userId: string,
    portfolioId: string,
  ): Promise<DividendProjectionsResponse> {
    // Verify portfolio ownership
    const portfolio = await this.prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new Error('Portfolio not found or access denied.');
    }

    // Get active positions with dividend info
    const positions =
      await this.getActivePositionsWithDividendInfo(portfolioId);

    // Generate 12-month projection array
    const projections = this.generateProjectionArray(positions);

    // Calculate summary
    const total12MonthProjection = projections.reduce(
      (sum, m) => sum + m.totalProjected,
      0,
    );

    return {
      projections,
      summary: {
        total12MonthProjection: parseFloat(total12MonthProjection.toFixed(2)),
        avgMonthlyProjection: parseFloat(
          (total12MonthProjection / 12).toFixed(2),
        ),
      },
    };
  }

  /**
   * Get active positions with their dividend info
   */
  private async getActivePositionsWithDividendInfo(portfolioId: string) {
    // Calculate current positions from transactions
    const buyTransactions = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'],
      where: { portfolioId, type: 'BUY' },
      _sum: { quantity: true },
    });

    const sellTransactions = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'],
      where: { portfolioId, type: 'SELL' },
      _sum: { quantity: true },
    });

    const sellMap = sellTransactions.reduce(
      (acc, s) => ({
        ...acc,
        [`${s.listingIsin}_${s.listingExchangeCode}`]: Math.abs(
          s._sum.quantity || 0,
        ),
      }),
      {} as Record<string, number>,
    );

    // Filter to active positions (quantity > 0)
    const activePositions = buyTransactions
      .map((buy) => {
        const key = `${buy.listingIsin}_${buy.listingExchangeCode}`;
        const soldQuantity = sellMap[key] || 0;
        const currentQuantity = Math.abs(buy._sum.quantity || 0) - soldQuantity;
        return {
          listingIsin: buy.listingIsin,
          listingExchangeCode: buy.listingExchangeCode,
          currentQuantity,
        };
      })
      .filter((p) => p.currentQuantity > 0.000001);

    if (activePositions.length === 0) {
      return [];
    }

    // Get listing and dividend info for each position
    const listingIds = activePositions.map((p) => ({
      isin: p.listingIsin,
      exchangeCode: p.listingExchangeCode,
    }));

    const listings = await this.prisma.listing.findMany({
      where: { OR: listingIds },
      include: { dividendInfo: true },
    });

    const listingMap = listings.reduce(
      (acc, l) => ({
        ...acc,
        [`${l.isin}_${l.exchangeCode}`]: l,
      }),
      {} as Record<string, (typeof listings)[0]>,
    );

    return activePositions.map((pos) => {
      const listing =
        listingMap[`${pos.listingIsin}_${pos.listingExchangeCode}`];
      return {
        ...pos,
        tickerSymbol: listing?.tickerSymbol || 'UNKNOWN',
        companyName: listing?.companyName || null,
        dividendInfo: listing?.dividendInfo || null,
        currentPrice: listing?.currentPrice || 0,
        dividendYield: listing?.dividendYield || null,
      };
    });
  }

  /**
   * Generate 12-month projection array for all positions
   */
  private generateProjectionArray(
    positions: Awaited<
      ReturnType<typeof this.getActivePositionsWithDividendInfo>
    >,
  ): MonthlyProjection[] {
    const now = new Date();
    const projections: MonthlyProjection[] = [];

    // Generate 12 months starting from current month
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

      const holdings: ProjectedDividend[] = [];

      for (const position of positions) {
        const projection = this.projectDividendForMonth(position, monthDate);

        if (projection) {
          holdings.push(projection);
        }
      }

      projections.push({
        month: monthKey,
        totalProjected: parseFloat(
          holdings.reduce((sum, h) => sum + h.amount, 0).toFixed(2),
        ),
        holdings,
      });
    }

    return projections;
  }

  /**
   * Project dividend for a single position in a specific month
   */
  private projectDividendForMonth(
    position: {
      currentQuantity: number;
      tickerSymbol: string;
      companyName: string | null;
      dividendInfo: {
        frequency: DividendFrequency | null;
        avgAmount: number | null;
        nextPaymentDate: Date | null;
        nextAmount: number | null;
      } | null;
      currentPrice: number;
      dividendYield: number | null;
    },
    targetMonth: Date,
  ): ProjectedDividend | null {
    const { dividendInfo, currentQuantity, tickerSymbol, companyName } =
      position;

    // No dividend info - skip
    if (!dividendInfo) {
      return null;
    }

    // Check if we have external data with a specific next payment date
    if (dividendInfo.nextPaymentDate && dividendInfo.nextAmount) {
      const nextDate = new Date(dividendInfo.nextPaymentDate);
      if (
        nextDate.getFullYear() === targetMonth.getFullYear() &&
        nextDate.getMonth() === targetMonth.getMonth()
      ) {
        // Per-payment amount calculation
        const frequency = dividendInfo.frequency || 'QUARTERLY';
        const paymentsPerYear = this.getPaymentsPerYear(frequency);
        const perPaymentAmount = dividendInfo.nextAmount / paymentsPerYear;

        return {
          tickerSymbol,
          companyName,
          amount: parseFloat((perPaymentAmount * currentQuantity).toFixed(2)),
          source: 'EXTERNAL_API',
        };
      }
    }

    // Fall back to historical pattern
    if (dividendInfo.frequency && dividendInfo.avgAmount) {
      const shouldPay = this.shouldPayInMonth(
        dividendInfo.frequency,
        targetMonth,
        dividendInfo.nextPaymentDate,
      );

      if (shouldPay) {
        return {
          tickerSymbol,
          companyName,
          amount: parseFloat(
            (dividendInfo.avgAmount * currentQuantity).toFixed(2),
          ),
          source: 'HISTORICAL_PATTERN',
        };
      }
    }

    // Try to estimate from dividend yield if no other data
    if (
      !dividendInfo.avgAmount &&
      position.dividendYield &&
      position.currentPrice
    ) {
      const annualDividendPerShare =
        (position.dividendYield / 100) * position.currentPrice;
      const frequency = dividendInfo.frequency || 'QUARTERLY';
      const paymentsPerYear = this.getPaymentsPerYear(frequency);
      const perPaymentAmount = annualDividendPerShare / paymentsPerYear;

      const shouldPay = this.shouldPayInMonth(frequency, targetMonth, null);
      if (shouldPay) {
        return {
          tickerSymbol,
          companyName,
          amount: parseFloat((perPaymentAmount * currentQuantity).toFixed(2)),
          source: 'HISTORICAL_PATTERN',
        };
      }
    }

    return null;
  }

  /**
   * Determine if a dividend should be paid in a given month based on frequency
   */
  private shouldPayInMonth(
    frequency: DividendFrequency,
    targetMonth: Date,
    nextPaymentDate: Date | null,
  ): boolean {
    const month = targetMonth.getMonth(); // 0-11

    // If we have a next payment date, use it to anchor the schedule
    if (nextPaymentDate) {
      const nextDate = new Date(nextPaymentDate);
      const monthDiff = this.monthDifference(nextDate, targetMonth);

      switch (frequency) {
        case 'MONTHLY':
          return true;
        case 'QUARTERLY':
          return monthDiff % 3 === 0;
        case 'SEMI_ANNUAL':
          return monthDiff % 6 === 0;
        case 'ANNUAL':
          return monthDiff % 12 === 0;
        default:
          return false;
      }
    }

    // Default payment months (common patterns)
    switch (frequency) {
      case 'MONTHLY':
        return true;
      case 'QUARTERLY':
        // Common quarterly months: Mar, Jun, Sep, Dec
        return [2, 5, 8, 11].includes(month);
      case 'SEMI_ANNUAL':
        // Common semi-annual months: Jun, Dec
        return [5, 11].includes(month);
      case 'ANNUAL':
        // Common annual month: December
        return month === 11;
      default:
        return false;
    }
  }

  private monthDifference(date1: Date, date2: Date): number {
    return Math.abs(
      (date2.getFullYear() - date1.getFullYear()) * 12 +
        (date2.getMonth() - date1.getMonth()),
    );
  }

  private getPaymentsPerYear(frequency: DividendFrequency): number {
    switch (frequency) {
      case 'MONTHLY':
        return 12;
      case 'QUARTERLY':
        return 4;
      case 'SEMI_ANNUAL':
        return 2;
      case 'ANNUAL':
        return 1;
      default:
        return 4; // Default to quarterly
    }
  }
}
