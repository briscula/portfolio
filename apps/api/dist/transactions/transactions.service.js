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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTransactionDto, userId) {
        if (!createTransactionDto.portfolioId) {
            throw new common_1.BadRequestException('Portfolio ID is required');
        }
        const portfolio = await this.prisma.portfolio.findUnique({
            where: {
                id: createTransactionDto.portfolioId,
                userId: userId,
            },
        });
        if (!portfolio) {
            throw new common_1.BadRequestException('Invalid Portfolio ID or access denied');
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
                reference: createTransactionDto.reference ||
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
    findByPortfolio(userId, portfolioId, page = 1, limit = 50) {
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
    async getPortfolioTransactionsPagination(userId, portfolioId, page = 1, limit = 50) {
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
    async findAll(queryDto, userId) {
        const { portfolioId, type, symbol, dateFrom, dateTo, limit = 20, offset = 0, sort = 'createdAt:desc', } = queryDto;
        const numericLimit = Number(limit);
        const numericOffset = Number(offset);
        const where = {
            portfolio: {
                userId: userId,
            },
        };
        if (portfolioId) {
            let portfolioIds = [];
            if (Array.isArray(portfolioId)) {
                portfolioIds = portfolioId;
            }
            else {
                const portfolioIdStr = portfolioId;
                portfolioIds = portfolioIdStr.split(',').map((id) => id.trim());
            }
            if (portfolioIds.length > 0) {
                where.portfolioId = {
                    in: portfolioIds.filter((id) => id && id.trim().length > 0),
                };
            }
        }
        if (type) {
            where.type = type;
        }
        if (symbol) {
            where.stockSymbol = {
                contains: symbol,
                mode: 'insensitive',
            };
        }
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.createdAt.lte = new Date(dateTo);
            }
        }
        const [sortField, sortOrder] = sort.split(':');
        const orderBy = {};
        orderBy[sortField] = sortOrder || 'desc';
        const total = await this.prisma.transaction.count({ where });
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
        const totalPages = Math.ceil(total / numericLimit);
        const currentPage = Math.floor(numericOffset / numericLimit);
        const meta = {
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
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map