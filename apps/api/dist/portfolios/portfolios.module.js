"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfoliosModule = void 0;
const common_1 = require("@nestjs/common");
const portfolios_service_1 = require("./portfolios.service");
const portfolios_controller_1 = require("./portfolios.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const users_module_1 = require("../users/users.module");
const positions_module_1 = require("../positions/positions.module");
const transactions_module_1 = require("../transactions/transactions.module");
const dividend_analytics_module_1 = require("../dividend-analytics/dividend-analytics.module");
let PortfoliosModule = class PortfoliosModule {
};
exports.PortfoliosModule = PortfoliosModule;
exports.PortfoliosModule = PortfoliosModule = __decorate([
    (0, common_1.Module)({
        controllers: [portfolios_controller_1.PortfoliosController],
        providers: [portfolios_service_1.PortfoliosService],
        imports: [
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            positions_module_1.PositionsModule,
            transactions_module_1.TransactionsModule,
            dividend_analytics_module_1.DividendAnalyticsModule,
        ],
    })
], PortfoliosModule);
//# sourceMappingURL=portfolios.module.js.map