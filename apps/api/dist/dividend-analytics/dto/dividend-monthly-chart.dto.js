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
exports.DividendMonthlyChartResponseDto = exports.DividendMonthlyChartDto = exports.MonthlyDataPointDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class MonthlyDataPointDto {
}
exports.MonthlyDataPointDto = MonthlyDataPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023' }),
    __metadata("design:type", String)
], MonthlyDataPointDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1250.75 }),
    __metadata("design:type", Number)
], MonthlyDataPointDto.prototype, "totalDividends", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8 }),
    __metadata("design:type", Number)
], MonthlyDataPointDto.prototype, "dividendCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['AAPL', 'MSFT', 'JNJ'] }),
    __metadata("design:type", Array)
], MonthlyDataPointDto.prototype, "companies", void 0);
class DividendMonthlyChartDto {
}
exports.DividendMonthlyChartDto = DividendMonthlyChartDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01' }),
    __metadata("design:type", String)
], DividendMonthlyChartDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'January' }),
    __metadata("design:type", String)
], DividendMonthlyChartDto.prototype, "monthName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [MonthlyDataPointDto] }),
    __metadata("design:type", Array)
], DividendMonthlyChartDto.prototype, "yearlyData", void 0);
class DividendMonthlyChartResponseDto {
}
exports.DividendMonthlyChartResponseDto = DividendMonthlyChartResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
    }),
    __metadata("design:type", Array)
], DividendMonthlyChartResponseDto.prototype, "months", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['2022', '2023', '2024'] }),
    __metadata("design:type", Array)
], DividendMonthlyChartResponseDto.prototype, "years", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DividendMonthlyChartDto] }),
    __metadata("design:type", Array)
], DividendMonthlyChartResponseDto.prototype, "data", void 0);
//# sourceMappingURL=dividend-monthly-chart.dto.js.map