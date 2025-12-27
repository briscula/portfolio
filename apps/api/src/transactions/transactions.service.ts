import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import {
  PaginatedTransactionsDto,
  PaginationMetaDto,
} from './dto/paginated-transactions.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction } from '@repo/database';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
    portfolioId: string,
  ): Promise<Transaction> {
    // Verify that the portfolio belongs to the user
    const portfolio = await this.prisma.portfolio.findUnique({
      where: {
        id: portfolioId, // Use portfolioId from argument
        userId: userId,
      },
    });

    if (!portfolio) {
      throw new BadRequestException('Invalid Portfolio ID or access denied');
    }

    // 1. Validate that the Exchange exists
    const exchange = await this.prisma.exchange.findUnique({
      where: { code: createTransactionDto.exchangeCode },
    });

    if (!exchange) {
      throw new BadRequestException(
        `Invalid exchange code: ${createTransactionDto.exchangeCode}. Exchange must exist in the system.`,
      );
    }

    // 2. Find or create the Listing
    // For DIVIDEND transactions, don't update companyName/tickerSymbol as they may contain dividend description text
    const isDividend = createTransactionDto.type === 'DIVIDEND';

    const listing = await this.prisma.listing.upsert({
      where: {
        isin_exchangeCode: {
          isin: createTransactionDto.isin,
          exchangeCode: createTransactionDto.exchangeCode,
        },
      },
      update: isDividend
        ? { currencyCode: createTransactionDto.currencyCode }
        : {
            tickerSymbol: createTransactionDto.tickerSymbol,
            companyName: createTransactionDto.companyName,
            currencyCode: createTransactionDto.currencyCode,
          },
      create: {
        isin: createTransactionDto.isin,
        exchangeCode: createTransactionDto.exchangeCode,
        tickerSymbol: createTransactionDto.tickerSymbol,
        companyName: createTransactionDto.companyName,
        currencyCode: createTransactionDto.currencyCode,
      },
    });

    return this.prisma.transaction.create({
      data: {
        portfolio: {
          connect: {
            id: portfolioId, // Use portfolioId from argument
          },
        },
        listing: {
          // Connect to Listing instead of Stock
          connect: {
            isin_exchangeCode: {
              isin: listing.isin,
              exchangeCode: listing.exchangeCode,
            },
          },
        },
        currency: {
          connect: {
            code: createTransactionDto.currencyCode, // Use currencyCode from DTO, which is now from Listing
          },
        },
        quantity: createTransactionDto.quantity,
        price: createTransactionDto.price,
        commission: createTransactionDto.commission || 0,
        reference:
          createTransactionDto.reference ||
          createTransactionDto.date +
            ' ' +
            createTransactionDto.tickerSymbol + // Use tickerSymbol from DTO/Listing
            ' ' +
            createTransactionDto.quantity,
        amount: createTransactionDto.amount,
        totalAmount: createTransactionDto.totalAmount,
        tax: createTransactionDto.tax || 0,
        taxPercentage: createTransactionDto.taxPercentage || 0,
        createdAt: createTransactionDto.date,
        notes: createTransactionDto.notes,
        type: createTransactionDto.type,
      },
    });
  }

  async findByPortfolio(
    userId: string,
    portfolioId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<Transaction[]> {
    // Specify return type for better type safety
    const skip = (page - 1) * limit;

    return this.prisma.transaction.findMany({
      where: {
        portfolioId: portfolioId,
        portfolio: {
          userId: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        // Add include for listing
        listing: {
          select: {
            tickerSymbol: true,
            companyName: true,
            isin: true,
            exchangeCode: true,
          },
        },
      },
    });
  }

  async getPortfolioTransactionsPagination(
    userId: string,
    portfolioId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const total = await this.prisma.transaction.count({
      where: {
        portfolioId: portfolioId,
        portfolio: {
          userId: userId,
        },
      },
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
    };
  }

  async findAll(
    queryDto: QueryTransactionsDto,
    userId: string,
    portfolioId: string, // Added
  ): Promise<PaginatedTransactionsDto> {
    const {
      type,
      symbol,
      dateFrom,
      dateTo,
      limit = 20,
      offset = 0,
      sort = 'createdAt:desc',
    } = queryDto;

    // Ensure limit and offset are numbers
    const numericLimit = Number(limit);
    const numericOffset = Number(offset);

    // Build where clause
    const where: any = {
      portfolioId: portfolioId, // Use the portfolioId from the argument
      portfolio: {
        userId: userId,
      },
    };

    // Filter by portfolio IDs
    if (portfolioId) {
      let portfolioIds: string[] = [];

      if (Array.isArray(portfolioId)) {
        portfolioIds = portfolioId;
      } else {
        // Handle case where transform didn't work - portfolioId might be a string
        const portfolioIdStr = portfolioId as unknown as string;
        portfolioIds = portfolioIdStr.split(',').map((id) => id.trim());
      }

      if (portfolioIds.length > 0) {
        where.portfolioId = {
          in: portfolioIds.filter((id) => id && id.trim().length > 0),
        };
      }
    }

    // Filter by transaction type
    if (type) {
      where.type = type;
    }

    // Filter by listing tickerSymbol
    if (symbol) {
      where.listing = {
        tickerSymbol: {
          contains: symbol,
          mode: 'insensitive',
        },
      };
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Parse sort parameter
    const [sortField, sortOrder] = sort.split(':');
    const orderBy: any = {};
    orderBy[sortField] = sortOrder || 'desc';

    // Get total count
    const total = await this.prisma.transaction.count({ where });

    // Get transactions with pagination
    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy,
      skip: numericOffset,
      take: numericLimit,
      include: {
        portfolio: {
          select: {
            id: true,
            name: true,
          },
        },
        listing: {
          // Include listing details
          select: {
            tickerSymbol: true,
            companyName: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / numericLimit);
    const currentPage = Math.floor(numericOffset / numericLimit);

    const meta: PaginationMetaDto = {
      page: currentPage,
      limit: numericLimit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages - 1,
      hasPrevPage: currentPage > 0,
    };

    return {
      data: transactions,
      meta,
    };
  }

  /**
   * Find all transactions across all portfolios for a user
   * Similar to findAll but doesn't require a specific portfolioId
   */
  async findAllAcrossPortfolios(
    queryDto: QueryTransactionsDto,
    userId: string,
  ): Promise<PaginatedTransactionsDto> {
    const {
      type,
      symbol,
      dateFrom,
      dateTo,
      limit = 20,
      offset = 0,
      sort = 'createdAt:desc',
      portfolioId, // Optional filter by portfolio(s)
    } = queryDto;

    // Ensure limit and offset are numbers
    const numericLimit = Number(limit);
    const numericOffset = Number(offset);

    // Build where clause - only filter by user's portfolios
    const where: any = {
      portfolio: {
        userId: userId,
      },
    };

    // Optional: Filter by specific portfolio IDs if provided in query
    if (portfolioId) {
      let portfolioIds: string[] = [];

      if (Array.isArray(portfolioId)) {
        portfolioIds = portfolioId;
      } else {
        // Handle comma-separated portfolio IDs
        const portfolioIdStr = portfolioId as unknown as string;
        portfolioIds = portfolioIdStr.split(',').map((id) => id.trim());
      }

      if (portfolioIds.length > 0) {
        where.portfolioId = {
          in: portfolioIds.filter((id) => id && id.trim().length > 0),
        };
      }
    }

    // Filter by transaction type
    if (type) {
      where.type = type;
    }

    // Filter by listing tickerSymbol
    if (symbol) {
      where.listing = {
        tickerSymbol: {
          contains: symbol,
          mode: 'insensitive',
        },
      };
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Parse sort parameter
    const [sortField, sortOrder] = sort.split(':');
    const orderBy: any = {};
    orderBy[sortField] = sortOrder || 'desc';

    // Get total count
    const total = await this.prisma.transaction.count({ where });

    // Get transactions with pagination
    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy,
      skip: numericOffset,
      take: numericLimit,
      include: {
        portfolio: {
          select: {
            id: true,
            name: true,
            currencyCode: true,
          },
        },
        listing: {
          select: {
            tickerSymbol: true,
            companyName: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / numericLimit);
    const currentPage = Math.floor(numericOffset / numericLimit);

    const meta: PaginationMetaDto = {
      page: currentPage,
      limit: numericLimit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages - 1,
      hasPrevPage: currentPage > 0,
    };

    return {
      data: transactions,
      meta,
    };
  }
}
