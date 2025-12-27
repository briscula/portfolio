import { Module } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceUpdaterController } from './price-updater.controller';
import { AuthModule } from '../auth/auth.module';
import { PricesModule } from '../prices/prices.module';

@Module({
  imports: [PrismaModule, AuthModule, PricesModule],
  providers: [PriceUpdaterService],
  controllers: [PriceUpdaterController],
})
export class PriceUpdaterModule {}
