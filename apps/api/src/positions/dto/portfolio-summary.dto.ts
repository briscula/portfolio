import { ApiProperty } from '@nestjs/swagger';

export class PortfolioSummaryDto {
  @ApiProperty({
    description: 'Total value of all positions in the portfolio',
    example: 125000.50,
  })
  totalValue: number;

  @ApiProperty({
    description: 'Total cost basis of all positions',
    example: 100000.00,
  })
  totalCost: number;

  @ApiProperty({
    description: 'Total unrealized gain/loss',
    example: 25000.50,
  })
  totalGain: number;

  @ApiProperty({
    description: 'Total unrealized gain/loss percentage',
    example: 25.00,
  })
  totalGainPercent: number;

  @ApiProperty({
    description: 'Total number of positions in the portfolio',
    example: 45,
  })
  positionCount: number;

  @ApiProperty({
    description: 'Total dividends received',
    example: 5000.00,
  })
  totalDividends: number;
}
