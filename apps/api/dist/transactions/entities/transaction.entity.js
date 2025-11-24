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
exports.TransactionEntity = void 0;
const database_1 = require("@repo/database");
const swagger_1 = require("@nestjs/swagger");
class TransactionEntity {
}
exports.TransactionEntity = TransactionEntity;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TransactionEntity.prototype, "portfolioId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ maxLength: 10 }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "stockSymbol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TransactionEntity.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10.5 }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.25 }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5.99 }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "commission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ maxLength: 10 }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1002.5 }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1008.49 }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "tax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "taxPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ maxLength: 255, required: false }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], TransactionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], TransactionEntity.prototype, "updatedAt", void 0);
//# sourceMappingURL=transaction.entity.js.map