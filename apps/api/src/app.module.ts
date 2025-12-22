import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { DividendAnalyticsModule } from './dividend-analytics/dividend-analytics.module';
import { PositionsModule } from './positions/positions.module';
import { PricesModule } from './prices/prices.module';
import { PriceUpdaterModule } from './price-updater/price-updater.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TransactionsModule,
    UsersModule,
    AuthModule,
    PortfoliosModule,
    DividendAnalyticsModule,
    PositionsModule,
    PricesModule,
    PriceUpdaterModule,
  ],
})
export class AppModule {}
