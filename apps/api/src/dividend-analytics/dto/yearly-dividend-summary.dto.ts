import { ApiProperty } from '@nestjs/swagger';

export class YearlyDividendSummaryDto {
  @ApiProperty({ example: 2023 })
  year: number;

  @ApiProperty({ example: 'AAPL', required: false })
  stockSymbol?: string;

  @ApiProperty({ example: 'Apple Inc.', required: false })
  companyName?: string;

  @ApiProperty({ example: 8500.25 })
  totalDividends: number;

  @ApiProperty({ example: 48 })
  dividendCount: number;

  @ApiProperty({ example: 12 })
  uniqueCompanies: number;

  @ApiProperty({ example: 177.09 })
  averageDividendAmount: number;
}
