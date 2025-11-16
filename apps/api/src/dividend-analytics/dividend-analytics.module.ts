import { Module } from '@nestjs/common';
import { DividendAnalyticsService } from './dividend-analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [],
  providers: [DividendAnalyticsService],
  exports: [DividendAnalyticsService],
})
export class DividendAnalyticsModule {}
