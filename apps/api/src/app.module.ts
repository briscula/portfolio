import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { DividendAnalyticsModule } from './dividend-analytics/dividend-analytics.module';
import { PositionsModule } from './positions/positions.module';

@Module({
  imports: [
    PrismaModule,
    TransactionsModule,
    UsersModule,
    AuthModule,
    PortfoliosModule,
    DividendAnalyticsModule,
    PositionsModule,
  ],
})
export class AppModule {}
