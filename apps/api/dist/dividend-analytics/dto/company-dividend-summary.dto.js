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
exports.CompanyDividendSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CompanyDividendSummaryDto {
}
exports.CompanyDividendSummaryDto = CompanyDividendSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AAPL' }),
    __metadata("design:type", String)
], CompanyDividendSummaryDto.prototype, "stockSymbol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Apple Inc.' }),
    __metadata("design:type", String)
], CompanyDividendSummaryDto.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2023 }),
    __metadata("design:type", Number)
], CompanyDividendSummaryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1250.75 }),
    __metadata("design:type", Number)
], CompanyDividendSummaryDto.prototype, "totalDividends", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4 }),
    __metadata("design:type", Number)
], CompanyDividendSummaryDto.prototype, "dividendCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000.0 }),
    __metadata("design:type", Number)
], CompanyDividendSummaryDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8.33 }),
    __metadata("design:type", Number)
], CompanyDividendSummaryDto.prototype, "yieldOnCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 312.69 }),
    __metadata("design:type", Number)
], CompanyDividendSummaryDto.prototype, "averageDividendPerPayment", void 0);
//# sourceMappingURL=company-dividend-summary.dto.js.map