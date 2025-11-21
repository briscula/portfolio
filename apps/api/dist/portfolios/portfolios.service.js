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
exports.PortfoliosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PortfoliosService = class PortfoliosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isValidUUID(uuid) {
        if (!uuid || typeof uuid !== 'string')
            return false;
        const trimmed = uuid.trim();
        const parts = trimmed.split('-');
        return (parts.length === 5 &&
            parts[0].length === 8 &&
            parts[1].length === 4 &&
            parts[2].length === 4 &&
            parts[3].length === 4 &&
            parts[4].length === 12);
    }
    async validatePortfolio(userId, portfolioId) {
        console.log('Portfolio ID in portfolios service:', portfolioId, 'Type:', typeof portfolioId);
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
    transformCurrency(currency) {
        if (!currency)
            return undefined;
        return {
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
        };
    }
    async create(createPortfolioDto, userId) {
        const { name, description } = createPortfolioDto;
        return this.prisma.portfolio.create({
            data: {
                name,
                description,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }
    async findAll(userId) {
        const portfolios = await this.prisma.portfolio.findMany({
            where: { userId: userId },
            include: {
                currency: true,
            },
        });
        return portfolios.map((portfolio) => ({
            ...portfolio,
            currency: this.transformCurrency(portfolio.currency),
        }));
    }
    async findOne(portfolioId, userId) {
        await this.validatePortfolio(userId, portfolioId);
        const portfolio = await this.prisma.portfolio.findUnique({
            where: { id: portfolioId, userId: userId },
            include: {
                currency: true,
            },
        });
        return {
            ...portfolio,
            currency: this.transformCurrency(portfolio.currency),
        };
    }
    async update(portfolioId, updatePortfolioDto, userId) {
        await this.validatePortfolio(userId, portfolioId);
        return this.prisma.portfolio.update({
            where: {
                id: portfolioId,
                userId: userId,
            },
            data: updatePortfolioDto,
        });
    }
    async remove(portfolioId, userId) {
        await this.validatePortfolio(userId, portfolioId);
        return this.prisma.portfolio.delete({
            where: { id: portfolioId, userId: userId },
        });
    }
};
exports.PortfoliosService = PortfoliosService;
exports.PortfoliosService = PortfoliosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PortfoliosService);
//# sourceMappingURL=portfolios.service.js.map