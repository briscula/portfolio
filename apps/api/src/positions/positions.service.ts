import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate UUID format (supports both v4 and v7)
   */
  private isValidUUID(uuid: string): boolean {
    // Basic UUID format check - 8-4-4-4-12 pattern
    if (!uuid || typeof uuid !== 'string') {
      console.log('UUID validation failed: not a string or empty', {
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
      console.log('UUID validation failed:', {
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
    console.log(
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
   * Get total portfolio value for a specific portfolio by aggregating transactions
   */
  async getPortfolioTotalValue(userId: string, portfolioId: string): Promise<number> {
    console.log('Getting portfolio total value for:', portfolioId);

    // Verify portfolio belongs to user
    const portfolio = await this.prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: userId
      }
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found or access denied.');
    }

    // Calculate net portfolio value by summing all transaction costs (BUY = positive, SELL = negative)
    const result = await this.prisma.transaction.aggregate({
      where: { 
        portfolioId,
        type: { in: ['BUY', 'SELL'] }
      },
      _sum: {
        cost: true
      }
    });
    
    // Return the net cost (positive means net investment, negative means net proceeds)
    // For percentage calculations, we want the absolute value of current holdings
    const netCost = result._sum.cost || 0;
    return Math.abs(netCost);
  }

  /**
   * Transform positions to ensure totalCost is positive for API responses
   */
  private transformPositionsForResponse(positions: any[]) {
    return positions.map((position) => ({
      ...position,
      totalCost: Math.abs(position.totalCost),
    }));
  }

  /**
   * Apply percentage calculations to positions
   */
  private applyPercentages(positions: any[], totalValue: number) {
    return positions.map((position) => ({
      ...position,
      totalCost: Math.abs(position.totalCost), // Ensure totalCost is positive for display
      portfolioPercentage:
        totalValue > 0
          ? parseFloat(
              ((Math.abs(position.totalCost) / totalValue) * 100).toFixed(2),
            )
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
        case 'totalCost':
          aValue = Math.abs(a.totalCost);
          bValue = Math.abs(b.totalCost);
          break;
        case 'totalDividends':
          aValue = a.totalDividends;
          bValue = b.totalDividends;
          break;
        case 'currentQuantity':
          aValue = a.currentQuantity;
          bValue = b.currentQuantity;
          break;
        case 'stockSymbol':
          aValue = a.stockSymbol;
          bValue = b.stockSymbol;
          break;
        case 'companyName':
          aValue = a.companyName || '';
          bValue = b.companyName || '';
          break;
        case 'sector':
          aValue = a.sector || '';
          bValue = b.sector || '';
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
   * Calculates positions by aggregating transactions grouped by stock
   */
  async getPortfolioPositions(
    userId: string,
    portfolioId: string,
    page: number = 1,
    limit: number = 50,
    sortBy: string = 'portfolioPercentage',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    console.log('Getting positions for portfolio:', portfolioId, 'User:', userId);

    // Verify portfolio belongs to user
    const portfolio = await this.prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: userId
      }
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found or access denied.');
    }

    // Debug: Check what transactions exist for this portfolio
    const allTransactions = await this.prisma.transaction.findMany({
      where: { portfolioId },
      select: { type: true, stockSymbol: true, cost: true, createdAt: true }
    });

    const skip = (page - 1) * limit;

    // Calculate positions by aggregating transactions grouped by stock
    const positions = await this.prisma.transaction.groupBy({
      by: ['stockSymbol'],
      where: {
        portfolioId,
        type: { in: ['BUY', 'SELL'] }
      },
      _sum: {
        quantity: true,
        cost: true
      },
      _max: {
        createdAt: true
      }
    });

    console.log('🔍 Raw positions from database:', {
      portfolioId,
      totalRawPositions: positions.length,
      positions: positions.map(p => ({
        stockSymbol: p.stockSymbol,
        quantity: p._sum.quantity,
        cost: p._sum.cost
      }))
    });

    // Get stock information for each position
    const stockSymbols = positions.map(p => p.stockSymbol);
    const stocks = await this.prisma.stock.findMany({
      where: {
        symbol: { in: stockSymbols }
      }
    });

    const stockMap = stocks.reduce((acc, stock) => {
      acc[stock.symbol] = stock;
      return acc;
    }, {} as Record<string, any>);


    // Transform aggregated data into position objects
    const allPositions = positions.map(position => {
      const stock = stockMap[position.stockSymbol];
      
      return {
        stockSymbol: position.stockSymbol,
        companyName: stock?.companyName || position.stockSymbol,
        sector: stock?.sector || null,
        currentQuantity: position._sum.quantity || 0,
        totalCost: position._sum.cost || 0, // Keep original sign for proper calculation
        lastTransactionDate: position._max.createdAt,
        portfolioName: portfolio.name
      };
    });

    console.log('🔍 Positions before filtering:', {
      totalBeforeFilter: allPositions.length,
      positions: allPositions.map(p => ({
        stockSymbol: p.stockSymbol,
        currentQuantity: p.currentQuantity,
        totalCost: p.totalCost
      }))
    });

    const filteredPositions = allPositions.filter(position => position.currentQuantity > 0); // Only include positions with remaining shares

    console.log('🔍 Positions after filtering:', {
      totalAfterFilter: filteredPositions.length,
      filteredOut: allPositions.length - filteredPositions.length,
      remaining: filteredPositions.map(p => ({
        stockSymbol: p.stockSymbol,
        currentQuantity: p.currentQuantity,
        totalCost: p.totalCost
      }))
    });

    // Calculate total portfolio value as sum of all current position values
    const totalPortfolioValue = filteredPositions.reduce((sum, position) => sum + Math.abs(position.totalCost), 0);
    
    console.log('📊 Portfolio calculation debug:', {
      totalPositions: filteredPositions.length,
      totalPortfolioValue,
      positionCosts: filteredPositions.map(p => ({ symbol: p.stockSymbol, cost: Math.abs(p.totalCost) }))
    });

    // Apply percentage calculations using the total value
    const positionsWithPercentages = this.applyPercentages(
      filteredPositions,
      totalPortfolioValue,
    );

    // Sort by the specified field
    const sortedPositions = this.sortPositions(
      positionsWithPercentages,
      sortBy,
      sortOrder,
    );

    // Transform positions to ensure totalCost is positive for API response
    const transformedPositions =
      this.transformPositionsForResponse(sortedPositions);

    // Apply pagination
    return transformedPositions.slice(skip, skip + limit);
  }

}
