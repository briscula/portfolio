import { Module } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceUpdaterController } from './price-updater.controller';

@Module({
  imports: [PrismaModule],
  providers: [PriceUpdaterService],
  controllers: [PriceUpdaterController]
})
export class PriceUpdaterModule {}
