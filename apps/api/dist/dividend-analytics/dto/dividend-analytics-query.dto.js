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
exports.DividendAnalyticsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class DividendAnalyticsQueryDto {
}
exports.DividendAnalyticsQueryDto = DividendAnalyticsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 2020 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], DividendAnalyticsQueryDto.prototype, "startYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 2023 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], DividendAnalyticsQueryDto.prototype, "endYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        example: '019948d2-53a8-7b91-858a-84524e123456',
        format: 'uuid',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DividendAnalyticsQueryDto.prototype, "portfolioId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'AAPL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DividendAnalyticsQueryDto.prototype, "stockSymbol", void 0);
//# sourceMappingURL=dividend-analytics-query.dto.js.map