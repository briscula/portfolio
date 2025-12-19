import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricesService } from '../prices/prices.service';
import { Listing } from '@repo/database'; // Import Listing model

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
        uuid,
        type: typeof uuid,
      });
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

    if (!isValid) {
        uuid,
        trimmed,
        parts,
        lengths: parts.map((p) => p.length),
      });
    }

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
      'Portfolio ID received:',
      portfolioId,
      'Type:',
      typeof portfolioId,
    );
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
    return positions.map(position => ({
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
    const portfolio = await this.prisma.portfolio.findUnique({ where: { id: portfolioId } });

    // 2. Get the exchange rate if the portfolio is not in USD
    const fxRate = portfolio.currencyCode === 'USD' 
      ? 1 
      : await this.pricesService.getExchangeRate('USD', portfolio.currencyCode);

    // 3. Calculate aggregated transaction data for positions
    const aggregatedTransactions = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'], // Group by listing composite key
      where: { portfolioId, type: { in: ['BUY', 'SELL'] } },
      _sum: { quantity: true, amount: true },
      _max: { createdAt: true },
    });

    const activePositions = aggregatedTransactions.filter(
      p => (p._sum.quantity || 0) > 0.000001,
    );

    if (activePositions.length === 0) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false }};
    }

    // 4. Get supplemental data (listing info and latest prices in USD)
    const listingIdentifiers = activePositions.map(p => ({
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
        // sector: true, // Sector is not directly on Listing, might need to derive or remove
      },
    });

    const prices = await this.prisma.stockPrice.findMany({
      where: {
        OR: listingIdentifiers.map(id => ({
          listingIsin: id.isin,
          listingExchangeCode: id.exchangeCode,
        })),
        currencyCode: 'USD',
      },
    });

    const listingMap = listings.reduce((acc, listing) => ({
      ...acc,
      [`${listing.isin}_${listing.exchangeCode}`]: listing,
    }), {});

    const priceMap = prices.reduce((acc, p) => ({
      ...acc,
      [`${p.listingIsin}_${p.listingExchangeCode}`]: p.price,
    }), {});


    // 5. Combine all data and convert to portfolio currency
    const positionsWithValues = activePositions.map(agg => {
      const listingInfo = listingMap[`${agg.listingIsin}_${agg.listingExchangeCode}`];
      const currentQuantity = agg._sum.quantity || 0;
      const totalAmountUSD = Math.abs(agg._sum.amount || 0); // Changed from totalCostUSD to totalAmountUSD
      const currentPriceUSD = priceMap[`${agg.listingIsin}_${agg.listingExchangeCode}`];
      
      const marketValueUSD = currentPriceUSD !== undefined ? currentQuantity * currentPriceUSD : totalAmountUSD;
      const unrealizedGainUSD = marketValueUSD - totalAmountUSD;
      
      // Convert all monetary values to the portfolio's currency
      const totalAmount = totalAmountUSD * fxRate; // Changed from totalCost to totalAmount
      const marketValue = marketValueUSD * fxRate;
      const currentPrice = currentPriceUSD !== undefined ? currentPriceUSD * fxRate : null;
      const unrealizedGain = unrealizedGainUSD * fxRate;
      const unrealizedGainPercent = totalAmount > 0 ? (unrealizedGain / totalAmount) * 100 : 0; // Changed from totalCost to totalAmount

      return {
        tickerSymbol: listingInfo?.tickerSymbol, // Use tickerSymbol from listingInfo
        companyName: listingInfo?.companyName || listingInfo?.tickerSymbol,
        sector: null, // Sector is removed, set to null
        currentQuantity,
        totalAmount, // Use totalAmount
        marketValue,
        currentPrice,
        unrealizedGain,
        unrealizedGainPercent: parseFloat(unrealizedGainPercent.toFixed(2)),
        lastTransactionDate: agg._max.createdAt,
        portfolioName: portfolio.name,
        // Add listing details for future use if needed
        listingIsin: listingInfo?.isin,
        listingExchangeCode: listingInfo?.exchangeCode,
      };
    });
    
    // 6. Calculate total portfolio value (now in portfolio's currency)
    const totalPortfolioValue = positionsWithValues.reduce((sum, p) => sum + p.marketValue, 0);

    const positionsWithPercentages = this.applyPercentages(positionsWithValues, totalPortfolioValue);
    
    // 7. Sort and paginate
    const sortedPositions = this.sortPositions(positionsWithPercentages, sortBy, sortOrder);
    
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
    const portfolio = await this.prisma.portfolio.findUnique({ where: { id: portfolioId } });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found or access denied.');
    }

    // 2. Get the exchange rate if the portfolio is not in USD
    const fxRate = portfolio.currencyCode === 'USD'
      ? 1
      : await this.pricesService.getExchangeRate('USD', portfolio.currencyCode);

    // 3. Aggregate transactions to get position data in USD
    const positions = await this.prisma.transaction.groupBy({
      by: ['listingIsin', 'listingExchangeCode'], // Group by listing composite key
      where: { portfolioId, type: { in: ['BUY', 'SELL'] } },
      _sum: { quantity: true, amount: true },
    });
    const activePositions = positions.filter(p => (p._sum.quantity || 0) > 0);

    // 4. Calculate total amount in USD
    const totalAmountUSD = activePositions.reduce(
      (sum, position) => sum + Math.abs(position._sum.amount || 0),
      0,
    );

    // 5. Get latest prices in USD
    const listingIdentifiers = activePositions.map(p => ({
      isin: p.listingIsin,
      exchangeCode: p.listingExchangeCode,
    }));

    const prices = await this.prisma.stockPrice.findMany({
      where: {
        OR: listingIdentifiers.map(id => ({
          listingIsin: id.isin,
          listingExchangeCode: id.exchangeCode,
        })),
        currencyCode: 'USD',
      },
    });

    const priceMap = prices.reduce((acc, p) => ({
      ...acc,
      [`${p.listingIsin}_${p.listingExchangeCode}`]: p.price,
    }), {});

    // 6. Calculate total value in USD
    const totalValueUSD = activePositions.reduce((sum, position) => {
      const currentPrice = priceMap[`${position.listingIsin}_${position.listingExchangeCode}`];
      const quantity = position._sum.quantity || 0;
      const historicalAmount = Math.abs(position._sum.amount || 0); // Changed from historicalCost to historicalAmount
      const marketValue = currentPrice !== undefined ? quantity * currentPrice : historicalAmount;
      return sum + marketValue;
    }, 0);

    // 7. Get total dividends in USD
    const dividendResult = await this.prisma.transaction.aggregate({
      where: { portfolioId, type: 'DIVIDEND' },
      _sum: { amount: true },
    });
    const totalDividendsUSD = Math.abs(dividendResult._sum.amount || 0);

    // 8. Convert all monetary values to the portfolio's currency
    const totalValue = totalValueUSD * fxRate;
    const totalAmount = totalAmountUSD * fxRate; // Changed from totalCost to totalAmount
    const totalDividends = totalDividendsUSD * fxRate;
    const totalGain = totalValue - totalAmount; // Changed from totalCost to totalAmount
    const totalGainPercent = totalAmount > 0 ? (totalGain / totalAmount) * 100 : 0; // Changed from totalCost to totalAmount

    return {
      totalValue,
      totalAmount, // Changed from totalCost to totalAmount
      totalGain,
      totalGainPercent: parseFloat(totalGainPercent.toFixed(2)),
      positionCount: activePositions.length,
      totalDividends,
    };
  }

}
