import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyDto } from './dto/currency.dto';
import { Portfolio } from '@repo/database';
export declare class PortfoliosService {
    private prisma;
    constructor(prisma: PrismaService);
    private isValidUUID;
    private validatePortfolio;
    private transformCurrency;
    create(createPortfolioDto: CreatePortfolioDto, userId: string): Promise<Portfolio>;
    findAll(userId: string): Promise<{
        currency: CurrencyDto;
        description: string | null;
        currencyCode: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findOne(portfolioId: string, userId: string): Promise<{
        currency: CurrencyDto;
        description: string | null;
        currencyCode: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(portfolioId: string, updatePortfolioDto: UpdatePortfolioDto, userId: string): Promise<{
        description: string | null;
        currencyCode: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(portfolioId: string, userId: string): Promise<{
        description: string | null;
        currencyCode: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
