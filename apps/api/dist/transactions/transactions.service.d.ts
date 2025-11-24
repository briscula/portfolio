import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { PaginatedTransactionsDto } from './dto/paginated-transactions.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTransactionDto: CreateTransactionDto, userId: string): Promise<any>;
    findByPortfolio(userId: string, portfolioId: string, page?: number, limit?: number): Promise<any>;
    getPortfolioTransactionsPagination(userId: string, portfolioId: string, page?: number, limit?: number): Promise<{
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }>;
    findAll(queryDto: QueryTransactionsDto, userId: string): Promise<PaginatedTransactionsDto>;
}
