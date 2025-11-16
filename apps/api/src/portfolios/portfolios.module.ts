import { Module } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { PortfoliosController } from './portfolios.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { PositionsModule } from '../positions/positions.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { DividendAnalyticsModule } from '../dividend-analytics/dividend-analytics.module';

@Module({
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  imports: [
    PrismaModule,
    UsersModule,
    PositionsModule,
    TransactionsModule,
    DividendAnalyticsModule,
  ],
})
export class PortfoliosModule {}
