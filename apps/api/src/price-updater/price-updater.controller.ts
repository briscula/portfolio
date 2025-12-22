import { Controller, Post, UseGuards } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('price-updater')
export class PriceUpdaterController {
  constructor(private readonly priceUpdaterService: PriceUpdaterService) {}

  @Post('run')
  @UseGuards(AuthGuard('jwt')) // Protect the endpoint
  async triggerUpdate() {
    this.priceUpdaterService.runPriceUpdate(); // Don't await, let it run in the background
    return { message: 'Price update job started.' };
  }
}
