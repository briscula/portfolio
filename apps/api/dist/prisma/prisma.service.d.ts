import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@repo/database';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    onModuleInit(): Promise<void>;
}
