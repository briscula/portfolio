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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfoliosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const portfolios_service_1 = require("./portfolios.service");
const create_portfolio_dto_1 = require("./dto/create-portfolio.dto");
const update_portfolio_dto_1 = require("./dto/update-portfolio.dto");
const unified_auth_guard_1 = require("../auth/unified-auth.guard");
const users_service_1 = require("../users/users.service");
const auth_utils_1 = require("../common/utils/auth.utils");
const positions_service_1 = require("../positions/positions.service");
const transactions_service_1 = require("../transactions/transactions.service");
const create_transaction_dto_1 = require("../transactions/dto/create-transaction.dto");
const dividend_analytics_service_1 = require("../dividend-analytics/dividend-analytics.service");
const dividend_analytics_query_dto_1 = require("../dividend-analytics/dto/dividend-analytics-query.dto");
let PortfoliosController = class PortfoliosController {
    constructor(portfoliosService, usersService, positionsService, transactionsService, dividendAnalyticsService) {
        this.portfoliosService = portfoliosService;
        this.usersService = usersService;
        this.positionsService = positionsService;
        this.transactionsService = transactionsService;
        this.dividendAnalyticsService = dividendAnalyticsService;
    }
    async create(createPortfolioDto, req) {
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        return this.portfoliosService.create(createPortfolioDto, userId);
    }
    async findAll(req) {
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        return this.portfoliosService.findAll(userId);
    }
    async findOne(id, req) {
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        return this.portfoliosService.findOne(id, userId);
    }
    async getPortfolioPositions(req, portfolioId, page, limit, sortBy, sortOrder) {
        console.log('Controller received portfolio ID:', portfolioId, 'Type:', typeof portfolioId);
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 50;
        const sortField = sortBy || 'portfolioPercentage';
        const order = sortOrder || 'desc';
        const positions = await this.positionsService.getPortfolioPositions(userId, portfolioId, pageNum, limitNum, sortField, order);
        return {
            data: positions,
            portfolioId: portfolioId,
            sort: {
                sortBy: sortField,
                sortOrder: order,
            },
        };
    }
    async getPortfolioTransactions(req, portfolioId, page, limit) {
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 50;
        const [transactions, pagination] = await Promise.all([
            this.transactionsService.findByPortfolio(userId, portfolioId, pageNum, limitNum),
            this.transactionsService.getPortfolioTransactionsPagination(userId, portfolioId, pageNum, limitNum),
        ]);
        return {
            data: transactions,
            portfolioId: portfolioId,
            pagination,
        };
    }
    async createPortfolioTransaction(req, portfolioId, createTransactionDto) {
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        const transactionData = {
            ...createTransactionDto,
            portfolioId: portfolioId,
        };
        const transaction = await this.transactionsService.create(transactionData, userId);
        return {
            data: transaction,
            portfolioId: portfolioId,
        };
    }
    async update(id, updatePortfolioDto, req) {
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        return this.portfoliosService.update(id, updatePortfolioDto, userId);
    }
    async remove(id, req) {
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        return this.portfoliosService.remove(id, userId);
    }
    async getPortfolioMonthlyDividends(portfolioId, query, req) {
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        const portfolioQuery = {
            ...query,
            portfolioId: portfolioId,
        };
        return this.dividendAnalyticsService.getMonthlyDividendOverview(userId, portfolioQuery);
    }
};
exports.PortfoliosController = PortfoliosController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Portfolio created successfully' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new portfolio',
        description: 'Creates a new portfolio for the authenticated user',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_portfolio_dto_1.CreatePortfolioDto, Object]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns all portfolios for the authenticated user',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all portfolios',
        description: 'Returns all portfolios owned by the authenticated user',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns a specific portfolio' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get portfolio by ID',
        description: 'Returns a specific portfolio owned by the authenticated user',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/positions'),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns positions for a specific portfolio' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get portfolio positions',
        description: 'Returns positions for a specific portfolio with pagination and sorting support',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 50)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        type: String,
        description: 'Sort field: portfolioPercentage, totalCost, totalDividends, currentQuantity, stockSymbol, companyName, sector, lastTransactionDate (default: portfolioPercentage)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortOrder',
        required: false,
        type: String,
        description: 'Sort order: asc or desc (default: desc)',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "getPortfolioPositions", null);
__decorate([
    (0, common_1.Get)(':id/transactions'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns transactions for a specific portfolio',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get portfolio transactions',
        description: 'Returns transactions for a specific portfolio with pagination support',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 50)',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "getPortfolioTransactions", null);
__decorate([
    (0, common_1.Post)(':id/transactions'),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Transaction created successfully' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create transaction in portfolio',
        description: 'Creates a new transaction in the specified portfolio',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "createPortfolioTransaction", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Portfolio updated successfully' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Update portfolio',
        description: 'Updates a specific portfolio owned by the authenticated user',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_portfolio_dto_1.UpdatePortfolioDto, Object]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Portfolio deleted successfully' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete portfolio',
        description: 'Deletes a specific portfolio owned by the authenticated user',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/dividends/monthly'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Monthly dividend data retrieved successfully',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get monthly dividend data for portfolio',
        description: 'Returns monthly dividend data optimized for charting for a specific portfolio',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dividend_analytics_query_dto_1.DividendAnalyticsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "getPortfolioMonthlyDividends", null);
exports.PortfoliosController = PortfoliosController = __decorate([
    (0, common_1.Controller)('portfolios'),
    (0, swagger_1.ApiTags)('portfolios'),
    (0, common_1.UseGuards)(unified_auth_guard_1.UnifiedAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [portfolios_service_1.PortfoliosService,
        users_service_1.UsersService,
        positions_service_1.PositionsService,
        transactions_service_1.TransactionsService,
        dividend_analytics_service_1.DividendAnalyticsService])
], PortfoliosController);
//# sourceMappingURL=portfolios.controller.js.map