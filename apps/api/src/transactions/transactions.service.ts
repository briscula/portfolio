import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
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
  constructor(private prisma: PrismaService) { }

  async create(createTransactionDto: CreateTransactionDto, userId: string): Promise<Transaction> {
    // Ensure portfolioId is provided
    if (!createTransactionDto.portfolioId) {
      throw new BadRequestException('Portfolio ID is required');
    }

    // Verify that the portfolio belongs to the user
    const portfolio = await this.prisma.portfolio.findUnique({
      where: {
        id: createTransactionDto.portfolioId,
        userId: userId,
      },
    });

    if (!portfolio) {
      throw new BadRequestException('Invalid Portfolio ID or access denied');
    }

    return this.prisma.transaction.create({
      data: {
        portfolio: {
          connect: {
            id: createTransactionDto.portfolioId,
          },
        },
        stock: {
          connectOrCreate: {
            where: { symbol: createTransactionDto.stockSymbol },
            create: {
              symbol: createTransactionDto.stockSymbol,
              companyName: createTransactionDto.stockSymbol,
            },
          },
        },
        currency: {
          connect: {
            code: createTransactionDto.currencyCode || 'USD',
          },
        },
        quantity: createTransactionDto.quantity,
        price: createTransactionDto.price,
        commission: createTransactionDto.commission || 0,
        reference:
          createTransactionDto.reference ||
          createTransactionDto.date +
          ' ' +
          createTransactionDto.stockSymbol +
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

  findByPortfolio(
    userId: string,
    portfolioId: string,
    page: number = 1,
    limit: number = 50,
  ) {
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
  ): Promise<PaginatedTransactionsDto> {
    const {
      portfolioId,
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

    // Filter by stock symbol
    if (symbol) {
      where.stockSymbol = {
        contains: symbol,
        mode: 'insensitive',
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
        stock: {
          select: {
            symbol: true,
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
