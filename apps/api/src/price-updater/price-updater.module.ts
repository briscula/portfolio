import { Module } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PriceUpdaterService]
})
export class PriceUpdaterModule {}
