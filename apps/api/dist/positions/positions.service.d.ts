import { PrismaService } from '../prisma/prisma.service';
export declare class PositionsService {
    private prisma;
    constructor(prisma: PrismaService);
    private isValidUUID;
    private validatePortfolio;
    getPortfolioTotalValue(userId: string, portfolioId: string): Promise<number>;
    private transformPositionsForResponse;
    private applyPercentages;
    private sortPositions;
    getPortfolioPositions(userId: string, portfolioId: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<any[]>;
}
