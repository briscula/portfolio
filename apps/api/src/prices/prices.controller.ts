import { Controller, Post, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../auth/unified-auth.guard';
import { PricesService } from './prices.service';

@Controller('prices')
@ApiTags('prices')
@UseGuards(UnifiedAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post('sync')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Sync all stock prices',
    description:
      'Triggers a background job to sync the latest prices for all known stocks in the database. Returns immediately with a 204 No Content response.',
  })
  syncAllPrices() {
    // Fire and forget: start the sync process without waiting for it to complete
    this.pricesService.syncAllStockPrices();
  }
}
