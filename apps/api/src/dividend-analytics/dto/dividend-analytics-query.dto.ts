import { createZodDto } from 'nestjs-zod';
import { DividendAnalyticsQuerySchema } from '../../common/schemas/dividend.schema';

// Create DTO class from Zod schema
export class DividendAnalyticsQueryDto extends createZodDto(
  DividendAnalyticsQuerySchema,
) {}
