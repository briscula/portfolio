import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { UsersService } from '../users/users.service';
import { PositionsService } from '../positions/positions.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { DividendAnalyticsService } from '../dividend-analytics/dividend-analytics.service';
import { DividendAnalyticsQueryDto } from '../dividend-analytics/dto/dividend-analytics-query.dto';
import { DividendMonthlyChartResponseDto } from '../dividend-analytics/dto/dividend-monthly-chart.dto';
export declare class PortfoliosController {
    private readonly portfoliosService;
    private readonly usersService;
    private readonly positionsService;
    private readonly transactionsService;
    private readonly dividendAnalyticsService;
    constructor(portfoliosService: PortfoliosService, usersService: UsersService, positionsService: PositionsService, transactionsService: TransactionsService, dividendAnalyticsService: DividendAnalyticsService);
    create(createPortfolioDto: CreatePortfolioDto, req: any): Promise<{
        description: string | null;
        currencyCode: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findAll(req: any): Promise<{
        currency: import("./dto/currency.dto").CurrencyDto;
        description: string | null;
        currencyCode: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        currency: import("./dto/currency.dto").CurrencyDto;
        description: string | null;
        currencyCode: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    getPortfolioPositions(req: any, portfolioId: string, page?: string, limit?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: any[];
        portfolioId: string;
        sort: {
            sortBy: string;
            sortOrder: "asc" | "desc";
        };
    }>;
    getPortfolioTransactions(req: any, portfolioId: string, page?: string, limit?: string): Promise<any>;
    createPortfolioTransaction(req: any, portfolioId: string, createTransactionDto: CreateTransactionDto): Promise<any>;
    update(id: string, updatePortfolioDto: UpdatePortfolioDto, req: any): Promise<{
        description: string | null;
        currencyCode: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string, req: any): Promise<{
        description: string | null;
        currencyCode: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    getPortfolioMonthlyDividends(portfolioId: string, query: DividendAnalyticsQueryDto, req: any): Promise<DividendMonthlyChartResponseDto>;
}
