import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { YahooFinanceProvider } from './yahoo-finance.provider';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PricesController],
  providers: [
    PricesService,
    YahooFinanceProvider,
    {
      provide: 'PriceProvider',
      useClass: YahooFinanceProvider,
    },
  ],
  exports: [PricesService, 'PriceProvider'],
})
export class PricesModule {}
