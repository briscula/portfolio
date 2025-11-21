"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DividendAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DividendAnalyticsService = class DividendAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCompanyDividendSummaries(userId, query) {
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        conditions.push(`t."portfolioId" IN (
      SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex}::uuid
    )`);
        params.push(userId);
        paramIndex++;
        if (query.portfolioId) {
            conditions.push(`t."portfolioId" = $${paramIndex}::uuid AND t."portfolioId" IN (
          SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex + 1}::uuid
        )`);
            params.push(query.portfolioId);
            params.push(userId);
            paramIndex += 2;
        }
        if (query.stockSymbol) {
            conditions.push(`t."stockSymbol" = $${paramIndex}`);
            params.push(query.stockSymbol);
            paramIndex++;
        }
        if (query.startYear) {
            conditions.push(`t."createdAt" >= $${paramIndex}`);
            params.push(new Date(query.startYear, 0, 1));
            paramIndex++;
        }
        if (query.endYear) {
            conditions.push(`t."createdAt" <= $${paramIndex}`);
            params.push(new Date(query.endYear, 11, 31));
            paramIndex++;
        }
        const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
        const companySummaries = (await this.prisma.$queryRawUnsafe(`WITH dividend_data AS (
        SELECT
          t."stockSymbol",
          s."companyName",
          EXTRACT(YEAR FROM t."createdAt") as year,
          SUM(CASE WHEN t."type" = 'DIVIDEND' THEN t."cost" ELSE 0 END) as total_dividends,
          COUNT(CASE WHEN t."type" = 'DIVIDEND' THEN 1 END) as dividend_count,
          SUM(CASE WHEN t."type" = 'BUY' THEN t."cost" ELSE 0 END) as total_cost
        FROM "transaction" t
        LEFT JOIN "stock" s ON t."stockSymbol" = s."symbol"
        WHERE ${whereClause}
        GROUP BY t."stockSymbol", s."companyName", EXTRACT(YEAR FROM t."createdAt")
        HAVING COUNT(CASE WHEN t."type" = 'DIVIDEND' THEN 1 END) > 0
      )
      SELECT
        "stockSymbol",
        "companyName",
        "year",
        "total_dividends",
        "dividend_count",
        "total_cost",
        CASE
          WHEN "total_cost" > 0 THEN ("total_dividends" / "total_cost") * 100
          ELSE 0
        END as yield_on_cost,
        CASE
          WHEN "dividend_count" > 0 THEN "total_dividends" / "dividend_count"
          ELSE 0
        END as avg_dividend_per_payment
      FROM dividend_data
      ORDER BY "stockSymbol", "year" DESC`, ...params));
        return companySummaries.map((row) => ({
            stockSymbol: row.stockSymbol,
            companyName: row.companyName || row.stockSymbol,
            year: parseInt(row.year),
            totalDividends: parseFloat(row.total_dividends),
            dividendCount: parseInt(row.dividend_count),
            totalCost: parseFloat(row.total_cost),
            yieldOnCost: parseFloat(row.yield_on_cost),
            averageDividendPerPayment: parseFloat(row.avg_dividend_per_payment),
        }));
    }
    async getMonthlyDividendOverview(userId, query) {
        const conditions = [`"type" = 'DIVIDEND'`];
        const params = [];
        let paramIndex = 1;
        conditions.push(`"portfolioId" IN (
      SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex}::uuid
    )`);
        params.push(userId);
        paramIndex++;
        if (query.portfolioId) {
            conditions.push(`"portfolioId" = $${paramIndex}::uuid AND "portfolioId" IN (
          SELECT "id" FROM "portfolio" WHERE "userId" = $${paramIndex + 1}::uuid
        )`);
            params.push(query.portfolioId);
            params.push(userId);
            paramIndex += 2;
        }
        if (query.stockSymbol) {
            conditions.push(`"stockSymbol" = $${paramIndex}`);
            params.push(query.stockSymbol);
            paramIndex++;
        }
        if (query.startYear) {
            conditions.push(`"createdAt" >= $${paramIndex}`);
            params.push(new Date(query.startYear, 0, 1));
            paramIndex++;
        }
        if (query.endYear) {
            conditions.push(`"createdAt" <= $${paramIndex}`);
            params.push(new Date(query.endYear, 11, 31));
            paramIndex++;
        }
        const whereClause = conditions.join(' AND ');
        const monthlyAggregates = (await this.prisma.$queryRawUnsafe(`SELECT
        EXTRACT(YEAR FROM "createdAt") as year,
        EXTRACT(MONTH FROM "createdAt") as month,
        TO_CHAR("createdAt", 'Month') as month_name,
        SUM("cost") as total_dividends,
        COUNT(*) as dividend_count,
        ARRAY_AGG(DISTINCT "stockSymbol") as companies
      FROM "transaction"
      WHERE ${whereClause}
      GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt"), TO_CHAR("createdAt", 'Month')
      ORDER BY year DESC, month DESC`, ...params));
        const monthGroups = new Map();
        monthlyAggregates.forEach((row) => {
            const monthKey = row.month.toString().padStart(2, '0');
            if (!monthGroups.has(monthKey)) {
                monthGroups.set(monthKey, []);
            }
            monthGroups.get(monthKey).push({
                year: row.year.toString(),
                totalDividends: parseFloat(row.total_dividends),
                dividendCount: parseInt(row.dividend_count),
                companies: row.companies,
            });
        });
        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        const years = [
            ...new Set(monthlyAggregates.map((row) => row.year.toString())),
        ].sort();
        const allMonths = [];
        for (let month = 1; month <= 12; month++) {
            const monthKey = month.toString().padStart(2, '0');
            const monthIndex = month - 1;
            const yearlyData = years.map(year => {
                const existingData = monthGroups.get(monthKey)?.find(data => data.year === year);
                if (existingData) {
                    return existingData;
                }
                else {
                    return {
                        year,
                        totalDividends: 0,
                        dividendCount: 0,
                        companies: [],
                    };
                }
            });
            allMonths.push({
                month: monthKey,
                monthName: monthNames[monthIndex],
                yearlyData: yearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year)),
            });
        }
        return {
            months: monthNames,
            years,
            data: allMonths,
        };
    }
};
exports.DividendAnalyticsService = DividendAnalyticsService;
exports.DividendAnalyticsService = DividendAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DividendAnalyticsService);
//# sourceMappingURL=dividend-analytics.service.js.map