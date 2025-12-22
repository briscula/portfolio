import { Module } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';

@Module({
  providers: [PriceUpdaterService]
})
export class PriceUpdaterModule {}
