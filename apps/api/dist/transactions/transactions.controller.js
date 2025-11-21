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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const query_transactions_dto_1 = require("./dto/query-transactions.dto");
const paginated_transactions_dto_1 = require("./dto/paginated-transactions.dto");
const swagger_1 = require("@nestjs/swagger");
const unified_auth_guard_1 = require("../auth/unified-auth.guard");
const users_service_1 = require("../users/users.service");
const auth_utils_1 = require("../common/utils/auth.utils");
let TransactionsController = class TransactionsController {
    constructor(transactionsService, usersService) {
        this.transactionsService = transactionsService;
        this.usersService = usersService;
    }
    async findAll(queryDto, req) {
        const userId = await auth_utils_1.AuthUtils.getUserIdFromToken(req, this.usersService);
        return this.transactionsService.findAll(queryDto, userId);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: paginated_transactions_dto_1.PaginatedTransactionsDto }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all transactions',
        description: 'Returns paginated list of transactions for the authenticated user with optional filtering',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_transactions_dto_1.QueryTransactionsDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findAll", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    (0, swagger_1.ApiTags)('transactions'),
    (0, common_1.UseGuards)(unified_auth_guard_1.UnifiedAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService,
        users_service_1.UsersService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map