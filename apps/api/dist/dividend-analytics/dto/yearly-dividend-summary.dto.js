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
exports.YearlyDividendSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class YearlyDividendSummaryDto {
}
exports.YearlyDividendSummaryDto = YearlyDividendSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2023 }),
    __metadata("design:type", Number)
], YearlyDividendSummaryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AAPL', required: false }),
    __metadata("design:type", String)
], YearlyDividendSummaryDto.prototype, "stockSymbol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Apple Inc.', required: false }),
    __metadata("design:type", String)
], YearlyDividendSummaryDto.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8500.25 }),
    __metadata("design:type", Number)
], YearlyDividendSummaryDto.prototype, "totalDividends", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 48 }),
    __metadata("design:type", Number)
], YearlyDividendSummaryDto.prototype, "dividendCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    __metadata("design:type", Number)
], YearlyDividendSummaryDto.prototype, "uniqueCompanies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 177.09 }),
    __metadata("design:type", Number)
], YearlyDividendSummaryDto.prototype, "averageDividendAmount", void 0);
//# sourceMappingURL=yearly-dividend-summary.dto.js.map