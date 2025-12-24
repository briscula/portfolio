import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const FmpQuoteSchema = z.array(
  z.object({
    symbol: z.string(),
    price: z.number(),
    // other fields can be added here if needed in the future
  })
);

export class FmpQuoteDto extends createZodDto(FmpQuoteSchema) {}
