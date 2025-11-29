import { createZodDto } from 'nestjs-zod';
import { CreatePortfolioSchema, UpdatePortfolioSchema } from '../../common/schemas/portfolio.schema';

// Create DTO classes from Zod schemas for NestJS compatibility
export class CreatePortfolioDto extends createZodDto(CreatePortfolioSchema) { }
export class UpdatePortfolioDto extends createZodDto(UpdatePortfolioSchema) { }
