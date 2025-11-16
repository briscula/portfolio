import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [],
  imports: [PrismaModule, UsersModule],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}
