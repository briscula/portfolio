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
exports.PositionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PositionsService = class PositionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isValidUUID(uuid) {
        if (!uuid || typeof uuid !== 'string') {
            console.log('UUID validation failed: not a string or empty', {
                uuid,
                type: typeof uuid,
            });
            return false;
        }
        const trimmed = uuid.trim();
        const parts = trimmed.split('-');
        const isValid = parts.length === 5 &&
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
    async validatePortfolio(userId, portfolioId) {
        console.log('Portfolio ID received:', portfolioId, 'Type:', typeof portfolioId);
        const portfolio = await this.prisma.portfolio.findFirst({
            where: {
                id: portfolioId,
                userId: userId,
            },
        });
        if (!portfolio) {
            throw new common_1.NotFoundException('Portfolio not found or access denied.');
        }
    }
    async getPortfolioTotalValue(userId, portfolioId) {
        console.log('Getting portfolio total value for:', portfolioId);
        const portfolio = await this.prisma.portfolio.findFirst({
            where: {
                id: portfolioId,
                userId: userId
            }
        });
        if (!portfolio) {
            throw new common_1.NotFoundException('Portfolio not found or access denied.');
        }
        const result = await this.prisma.transaction.aggregate({
            where: {
                portfolioId,
                type: { in: ['BUY', 'SELL'] }
            },
            _sum: {
                amount: true
            }
        });
        const netAmount = result._sum.amount || 0;
        return Math.abs(netAmount);
    }
    transformPositionsForResponse(positions) {
        return positions.map((position) => ({
            ...position,
            totalCost: Math.abs(position.totalCost),
        }));
    }
    applyPercentages(positions, totalValue) {
        return positions.map((position) => ({
            ...position,
            totalCost: Math.abs(position.totalCost),
            portfolioPercentage: totalValue > 0
                ? parseFloat(((Math.abs(position.totalCost) / totalValue) * 100).toFixed(2))
                : 0,
        }));
    }
    sortPositions(positions, sortBy, sortOrder) {
        return positions.sort((a, b) => {
            let aValue;
            let bValue;
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
                    aValue = a.portfolioPercentage;
                    bValue = b.portfolioPercentage;
            }
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            }
            else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    }
    async getPortfolioPositions(userId, portfolioId, page = 1, limit = 50, sortBy = 'portfolioPercentage', sortOrder = 'desc') {
        console.log('Getting positions for portfolio:', portfolioId, 'User:', userId);
        const portfolio = await this.prisma.portfolio.findFirst({
            where: {
                id: portfolioId,
                userId: userId
            }
        });
        if (!portfolio) {
            throw new common_1.NotFoundException('Portfolio not found or access denied.');
        }
        const allTransactions = await this.prisma.transaction.findMany({
            where: { portfolioId },
            select: { type: true, stockSymbol: true, amount: true, createdAt: true }
        });
        const skip = (page - 1) * limit;
        const positions = await this.prisma.transaction.groupBy({
            by: ['stockSymbol'],
            where: {
                portfolioId,
                type: { in: ['BUY', 'SELL'] }
            },
            _sum: {
                quantity: true,
                amount: true
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
                amount: p._sum.amount
            }))
        });
        const stockSymbols = positions.map(p => p.stockSymbol);
        const stocks = await this.prisma.stock.findMany({
            where: {
                symbol: { in: stockSymbols }
            }
        });
        const stockMap = stocks.reduce((acc, stock) => {
            acc[stock.symbol] = stock;
            return acc;
        }, {});
        const allPositions = positions.map(position => {
            const stock = stockMap[position.stockSymbol];
            return {
                stockSymbol: position.stockSymbol,
                companyName: stock?.companyName || position.stockSymbol,
                sector: stock?.sector || null,
                currentQuantity: position._sum.quantity || 0,
                totalCost: position._sum.amount || 0,
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
        const filteredPositions = allPositions.filter(position => position.currentQuantity > 0);
        console.log('🔍 Positions after filtering:', {
            totalAfterFilter: filteredPositions.length,
            filteredOut: allPositions.length - filteredPositions.length,
            remaining: filteredPositions.map(p => ({
                stockSymbol: p.stockSymbol,
                currentQuantity: p.currentQuantity,
                totalCost: p.totalCost
            }))
        });
        const totalPortfolioValue = filteredPositions.reduce((sum, position) => sum + Math.abs(position.totalCost), 0);
        console.log('📊 Portfolio calculation debug:', {
            totalPositions: filteredPositions.length,
            totalPortfolioValue,
            positionCosts: filteredPositions.map(p => ({ symbol: p.stockSymbol, cost: Math.abs(p.totalCost) }))
        });
        const positionsWithPercentages = this.applyPercentages(filteredPositions, totalPortfolioValue);
        const sortedPositions = this.sortPositions(positionsWithPercentages, sortBy, sortOrder);
        const transformedPositions = this.transformPositionsForResponse(sortedPositions);
        return transformedPositions.slice(skip, skip + limit);
    }
};
exports.PositionsService = PositionsService;
exports.PositionsService = PositionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PositionsService);
//# sourceMappingURL=positions.service.js.map