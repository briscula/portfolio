import { Controller, Post } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';

@Controller('price-updater')
export class PriceUpdaterController {
  constructor(private readonly priceUpdaterService: PriceUpdaterService) {}

  @Post('run')
  async triggerUpdate() {
    this.priceUpdaterService.runPriceUpdate(); // Don't await, let it run in the background
    return { message: 'Price update job started.' };
  }
}
