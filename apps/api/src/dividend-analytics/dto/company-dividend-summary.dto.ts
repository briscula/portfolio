import { ApiProperty } from '@nestjs/swagger';

export class CompanyDividendSummaryDto {
  @ApiProperty({ example: 'AAPL' })
  stockSymbol: string;

  @ApiProperty({ example: 'Apple Inc.' })
  companyName: string;

  @ApiProperty({ example: 2023 })
  year: number;

  @ApiProperty({ example: 1250.75 })
  totalDividends: number;

  @ApiProperty({ example: 4 })
  dividendCount: number;

  @ApiProperty({ example: 15000.0 })
  totalCost: number;

  @ApiProperty({ example: 8.33 })
  yieldOnCost: number;

  @ApiProperty({ example: 312.69 })
  averageDividendPerPayment: number;
}
