import { Module } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceUpdaterController } from './price-updater.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [PriceUpdaterService],
  controllers: [PriceUpdaterController],
})
export class PriceUpdaterModule {}
