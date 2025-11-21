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
exports.DividendMonthlyComparisonDto = exports.DividendMonthlyAggregateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class DividendMonthlyAggregateDto {
}
exports.DividendMonthlyAggregateDto = DividendMonthlyAggregateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023' }),
    __metadata("design:type", String)
], DividendMonthlyAggregateDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01' }),
    __metadata("design:type", String)
], DividendMonthlyAggregateDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'January' }),
    __metadata("design:type", String)
], DividendMonthlyAggregateDto.prototype, "monthName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1250.75 }),
    __metadata("design:type", Number)
], DividendMonthlyAggregateDto.prototype, "totalDividends", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8 }),
    __metadata("design:type", Number)
], DividendMonthlyAggregateDto.prototype, "dividendCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['AAPL', 'MSFT', 'JNJ'] }),
    __metadata("design:type", Array)
], DividendMonthlyAggregateDto.prototype, "companies", void 0);
class DividendMonthlyComparisonDto {
}
exports.DividendMonthlyComparisonDto = DividendMonthlyComparisonDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01' }),
    __metadata("design:type", String)
], DividendMonthlyComparisonDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'January' }),
    __metadata("design:type", String)
], DividendMonthlyComparisonDto.prototype, "monthName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DividendMonthlyAggregateDto] }),
    __metadata("design:type", Array)
], DividendMonthlyComparisonDto.prototype, "yearlyData", void 0);
//# sourceMappingURL=dividend-monthly-aggregate.dto.js.map