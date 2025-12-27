import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricesService } from '../prices/prices.service';

@Injectable()
export class PositionsService {
  constructor(
    private prisma: PrismaService,
    private pricesService: PricesService,
  ) {}

  /**
   * Validate UUID format (supports both v4 and v7)
   */
  private isValidUUID(uuid: string): boolean {
    // Basic UUID format check - 8-4-4-4-12 pattern
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    const trimmed = uuid.trim();
    const parts = trimmed.split('-');
    const isValid =
      parts.length === 5 &&
      parts[0].length === 8 &&
      parts[1].length === 4 &&
      parts[2].length === 4 &&
      parts[3].length === 4 &&
      parts[4].length === 12;

    return isValid;
  }

  /**
   * Validate portfolio exists and belongs to user
   */
  private async validatePortfolio(
    userId: string,
    portfolioId: string,
  ): Promise<void> {
    // Temporarily disable UUID validation to test endpoint
    // if (!this.isValidUUID(portfolioId)) {
    //   throw new BadRequestException('Invalid portfolio ID format. Expected UUID format.');
    // }

    const portfolio = await this.prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: userId,
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found or access denied.');
    }
  }

  /**
   * Transform positions to ensure totalAmount is positive for API responses
   */
  private transformPositionsForResponse(positions: any[]) {
    return positions.map((position) => ({
      ...position,
      totalAmount: Math.abs(position.totalAmount),
    }));
  }

  /**
   * Apply percentage calculations to positions
   */
  private applyPercentages(positions: any[], totalValue: number) {
    return positions.map((position) => ({
      ...position,
      portfolioPercentage:
        totalValue > 0
          ? parseFloat(((position.marketValue / totalValue) * 100).toFixed(2))
          : 0,
    }));
  }

  /**
   * Sort positions by specified field
   */
  private sortPositions(
    positions: any[],
    sortBy: string,
    sortOrder: 'asc' | 'desc',
  ) {
    return positions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'portfolioPercentage':
          aValue = a.portfolioPercentage;
          bValue = b.portfolioPercentage;
          break;
        case 'totalAmount': // Now using totalAmount
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'marketValue':
          aValue = a.marketValue;
          bValue = b.marketValue;
          break;
        case 'totalDividends':
          aValue = a.totalDividends;
          bValue = b.totalDividends;
          break;
        case 'currentQuantity':
          aValue = a.currentQuantity;
          bValue = b.currentQuantity;
          break;
        case 'tickerSymbol': // Updated from stockSymbol
          aValue = a.tickerSymbol;
          bValue = b.tickerSymbol;
          break;
        case 'companyName':
          aValue = a.companyName || '';
          bValue = b.companyName || '';
          break;
        case 'sector': // Removed sector, as it's not directly in Listing
          aValue = a.companyName || ''; // Fallback to companyName for sorting if sector is removed
          bValue = b.companyName || '';
          break;
        case 'lastTransactionDate':
          aValue = new Date(a.lastTransactionDate);
          bValue = new Date(b.lastTransactionDate);
          break;
        default:
          // Default to portfolio percentage
          aValue = a.portfolioPercentage;
          bValue = b.portfolioPercentage;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  /**
   * Get positions for a specific portfolio with percentage calculations
   * Calculates positions by aggregating transactions grouped by listing
   */
  async getPortfolioPositions(
    userId: string,
    portfolioId: string,
    page: number = 1,
    limit: number = 50,
    sortBy: string = 'marketValue',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    // 1. Verify portfolio belongs to user and get its currency
    await this.validatePortfolio(userId, portfolioId);
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    // 2. Portfolio's target currency
    const portfolioCurrency = portfolio.currencyCode;

    // 3. Calculate aggregated transaction data for positions
    // Get BUY transactions for cost basis calculation
    const buyTransactions = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'],
      where: { portfolioId, type: 'BUY' },
      _sum: { quantity: true, amount: true },
      _max: { createdAt: true },
    });

    // Get SELL transactions for quantity adjustment
    const sellTransactions = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'],
      where: { portfolioId, type: 'SELL' },
      _sum: { quantity: true },
    });

    // Create maps for easy lookup (use Math.abs since SELL quantities may be stored as negative)
    const sellMap = sellTransactions.reduce(
      (acc, s) => ({
        ...acc,
        [`${s.listingIsin}_${s.listingExchangeCode}`]: Math.abs(
          s._sum.quantity || 0,
        ),
      }),
      {} as Record<string, number>,
    );

    // Calculate active positions with correct cost basis
    const activePositions = buyTransactions
      .map((buy) => {
        const key = `${buy.listingIsin}_${buy.listingExchangeCode}`;
        const soldQuantity = sellMap[key] || 0;
        const currentQuantity = Math.abs(buy._sum.quantity || 0) - soldQuantity;
        const totalBuyAmount = Math.abs(buy._sum.amount || 0);
        const totalBuyQuantity = Math.abs(buy._sum.quantity || 0);
        // Cost basis using average cost method
        const costBasis =
          totalBuyQuantity > 0
            ? (totalBuyAmount / totalBuyQuantity) * currentQuantity
            : 0;

        return {
          listingIsin: buy.listingIsin,
          listingExchangeCode: buy.listingExchangeCode,
          currentQuantity,
          costBasis,
          lastTransactionDate: buy._max.createdAt,
        };
      })
      .filter((p) => p.currentQuantity > 0.000001);

    if (activePositions.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    // 4. Get supplemental data (listing info and latest prices in USD)
    const listingIdentifiers = activePositions.map((p) => ({
      isin: p.listingIsin,
      exchangeCode: p.listingExchangeCode,
    }));

    const listings = await this.prisma.listing.findMany({
      where: {
        OR: listingIdentifiers, // Query by composite key
      },
      select: {
        isin: true,
        exchangeCode: true,
        tickerSymbol: true,
        companyName: true,
        currentPrice: true,
        currencyCode: true, // Currency of the price
      },
    });

    // Get dividend data for each position
    const dividendData = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'],
      where: {
        portfolioId,
        type: 'DIVIDEND',
        OR: listingIdentifiers.map((id) => ({
          listingIsin: id.isin,
          listingExchangeCode: id.exchangeCode,
        })),
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const listingMap = listings.reduce(
      (acc, listing) => ({
        ...acc,
        [`${listing.isin}_${listing.exchangeCode}`]: listing,
      }),
      {} as Record<string, (typeof listings)[0]>,
    );

    const dividendMap = dividendData.reduce(
      (acc, d) => ({
        ...acc,
        [`${d.listingIsin}_${d.listingExchangeCode}`]: {
          totalDividends: Math.abs(d._sum.amount || 0),
          dividendCount: d._count.id || 0,
        },
      }),
      {},
    );

    // 5. Get FX rates for all unique listing currencies to portfolio currency
    const uniqueCurrencies = [
      ...new Set(listings.map((l) => l.currencyCode).filter(Boolean)),
    ];
    const fxRates: Record<string, number> = {};
    for (const currency of uniqueCurrencies) {
      if (currency === portfolioCurrency) {
        fxRates[currency] = 1;
      } else {
        fxRates[currency] = await this.pricesService.getExchangeRate(
          currency,
          portfolioCurrency,
        );
      }
    }

    // 6. Combine all data and convert to portfolio currency
    const positionsWithValues = activePositions.map((pos) => {
      const listingInfo =
        listingMap[`${pos.listingIsin}_${pos.listingExchangeCode}`];
      const dividendInfo = dividendMap[
        `${pos.listingIsin}_${pos.listingExchangeCode}`
      ] || { totalDividends: 0, dividendCount: 0 };

      const listingCurrency = listingInfo?.currencyCode || 'USD';
      const fxRate = fxRates[listingCurrency] || 1;
      const nativePrice = listingInfo?.currentPrice ?? undefined;

      // Calculate market value in listing's native currency, then convert
      const nativeMarketValue =
        nativePrice !== undefined
          ? pos.currentQuantity * nativePrice
          : pos.costBasis; // costBasis is already in portfolio currency

      // Convert price and market value to portfolio currency
      const currentPrice = nativePrice !== undefined ? nativePrice * fxRate : null;
      const marketValue =
        nativePrice !== undefined ? nativeMarketValue * fxRate : pos.costBasis;

      // Cost basis is already in portfolio currency (from transactions)
      const totalCost = pos.costBasis;
      const unrealizedGain = marketValue - totalCost;
      const unrealizedGainPercent =
        totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0;

      // Dividends are already in portfolio currency (from transactions)
      const totalDividends = dividendInfo.totalDividends;

      return {
        tickerSymbol: listingInfo?.tickerSymbol,
        companyName: listingInfo?.companyName || listingInfo?.tickerSymbol,
        sector: null,
        currentQuantity: pos.currentQuantity,
        totalAmount: totalCost, // For backward compatibility
        totalCost,
        marketValue,
        currentPrice,
        unrealizedGain,
        unrealizedGainPercent: parseFloat(unrealizedGainPercent.toFixed(2)),
        lastTransactionDate: pos.lastTransactionDate,
        portfolioName: portfolio.name,
        totalDividends: parseFloat(totalDividends.toFixed(2)),
        dividendCount: dividendInfo.dividendCount,
        listingIsin: pos.listingIsin,
        listingExchangeCode: pos.listingExchangeCode,
      };
    });

    // 7. Calculate total portfolio value (now in portfolio's currency)
    const totalPortfolioValue = positionsWithValues.reduce(
      (sum, p) => sum + p.marketValue,
      0,
    );

    const positionsWithPercentages = this.applyPercentages(
      positionsWithValues,
      totalPortfolioValue,
    );

    // 7. Sort and paginate
    const sortedPositions = this.sortPositions(
      positionsWithPercentages,
      sortBy,
      sortOrder,
    );

    const totalPositions = sortedPositions.length;
    const totalPages = Math.ceil(totalPositions / limit);
    const skip = (page - 1) * limit;
    const paginatedData = sortedPositions.slice(skip, skip + limit);

    return {
      data: paginatedData,
      meta: {
        total: totalPositions,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get portfolio summary with aggregated metrics
   * Calculates total value, cost, gain, and dividend information for all positions
   */
  async getPortfolioSummary(userId: string, portfolioId: string) {
    // 1. Verify portfolio belongs to user and get its currency
    await this.validatePortfolio(userId, portfolioId);
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found or access denied.');
    }

    const portfolioCurrency = portfolio.currencyCode;

    // 2. Get BUY and SELL transactions separately for correct cost basis
    const buyTransactions = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'],
      where: { portfolioId, type: 'BUY' },
      _sum: { quantity: true, amount: true },
    });

    const sellTransactions = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'],
      where: { portfolioId, type: 'SELL' },
      _sum: { quantity: true },
    });

    // Use Math.abs since SELL quantities may be stored as negative
    const sellMap = sellTransactions.reduce(
      (acc, s) => ({
        ...acc,
        [`${s.listingIsin}_${s.listingExchangeCode}`]: Math.abs(
          s._sum.quantity || 0,
        ),
      }),
      {} as Record<string, number>,
    );

    // Calculate active positions with correct cost basis
    const activePositions = buyTransactions
      .map((buy) => {
        const key = `${buy.listingIsin}_${buy.listingExchangeCode}`;
        const soldQuantity = sellMap[key] || 0;
        const currentQuantity = Math.abs(buy._sum.quantity || 0) - soldQuantity;
        const totalBuyAmount = Math.abs(buy._sum.amount || 0);
        const totalBuyQuantity = Math.abs(buy._sum.quantity || 0);
        const costBasis =
          totalBuyQuantity > 0
            ? (totalBuyAmount / totalBuyQuantity) * currentQuantity
            : 0;

        return {
          listingIsin: buy.listingIsin,
          listingExchangeCode: buy.listingExchangeCode,
          currentQuantity,
          costBasis,
        };
      })
      .filter((p) => p.currentQuantity > 0.000001);

    // 3. Calculate total cost basis (already in portfolio currency from transactions)
    const totalCost = activePositions.reduce(
      (sum, position) => sum + position.costBasis,
      0,
    );

    // 4. Get listings with current prices and currencies
    const listingIdentifiers = activePositions.map((p) => ({
      isin: p.listingIsin,
      exchangeCode: p.listingExchangeCode,
    }));

    let listingMap: Record<
      string,
      { currentPrice: number | null; currencyCode: string }
    > = {};

    if (listingIdentifiers.length > 0) {
      const listings = await this.prisma.listing.findMany({
        where: {
          OR: listingIdentifiers,
        },
        select: {
          isin: true,
          exchangeCode: true,
          currentPrice: true,
          currencyCode: true,
        },
      });

      listingMap = listings.reduce(
        (acc, l) => ({
          ...acc,
          [`${l.isin}_${l.exchangeCode}`]: {
            currentPrice: l.currentPrice,
            currencyCode: l.currencyCode,
          },
        }),
        {} as Record<
          string,
          { currentPrice: number | null; currencyCode: string }
        >,
      );
    }

    // 5. Get FX rates for all unique listing currencies to portfolio currency
    const uniqueCurrencies = [
      ...new Set(
        Object.values(listingMap)
          .map((l) => l.currencyCode)
          .filter(Boolean),
      ),
    ];
    const fxRates: Record<string, number> = {};
    for (const currency of uniqueCurrencies) {
      if (currency === portfolioCurrency) {
        fxRates[currency] = 1;
      } else {
        fxRates[currency] = await this.pricesService.getExchangeRate(
          currency,
          portfolioCurrency,
        );
      }
    }

    // 6. Calculate total value (converting each position from its native currency)
    const totalValue = activePositions.reduce((sum, position) => {
      const listing =
        listingMap[`${position.listingIsin}_${position.listingExchangeCode}`];
      const currentPrice = listing?.currentPrice;
      const listingCurrency = listing?.currencyCode || 'USD';
      const fxRate = fxRates[listingCurrency] || 1;

      if (currentPrice !== undefined && currentPrice !== null) {
        // Convert from listing's currency to portfolio currency
        return sum + position.currentQuantity * currentPrice * fxRate;
      }
      // Fall back to cost basis if no current price
      return sum + position.costBasis;
    }, 0);

    // 7. Get total dividends (already in portfolio currency from transactions)
    const dividendResult = await this.prisma.transaction.aggregate({
      where: { portfolioId, type: 'DIVIDEND' },
      _sum: { amount: true },
    });
    const totalDividends = Math.abs(dividendResult._sum.amount || 0);

    // 8. Calculate gains
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent: parseFloat(totalGainPercent.toFixed(2)),
      positionCount: activePositions.length,
      totalDividends,
    };
  }
}
