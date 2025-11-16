import { PrismaService } from '../prisma/prisma.service';
import { CompanyDividendSummaryDto } from './dto/company-dividend-summary.dto';
import { DividendMonthlyChartResponseDto } from './dto/dividend-monthly-chart.dto';
import { DividendAnalyticsQueryDto } from './dto/dividend-analytics-query.dto';
export declare class DividendAnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getCompanyDividendSummaries(userId: string, query: DividendAnalyticsQueryDto): Promise<CompanyDividendSummaryDto[]>;
    getMonthlyDividendOverview(userId: string, query: DividendAnalyticsQueryDto): Promise<DividendMonthlyChartResponseDto>;
}
