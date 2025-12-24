# Quickstart Guide: Implementing the Price Updater Service

**Status**: Draft

This guide provides the steps for a developer to implement the scheduled price update service.

### Prerequisites

- You have an API key from [Financial Modeling Prep (FMP)](https://site.financialmodelingprep.com/developer/docs).
- You are on the feature branch `001-dividend-yield-on-cost-marker`.

### Backend Implementation (`apps/api`)

#### Step 1: Configure Environment Variables

1.  Add your FMP API key to your local `.env` file (create it if it doesn't exist in `apps/api`):
    ```env
    # .env
    FMP_API_KEY=your_api_key_here
    ```
2.  Add the variable to the example file `apps/api/.env.example`:
    ```env
    # .env.example
    FMP_API_KEY=
    ```
3.  Update the environment schema in `packages/env/src/index.ts` to include the new variable:
    ```typescript
    // packages/env/src/index.ts
    // ... inside the z.object({ ... })
    FMP_API_KEY: z.string().min(1),
    // ...
    ```

#### Step 2: Create the Price Updater Module

1.  Generate a new module and service using the Nest CLI from the `apps/api` directory:
    ```bash
    nest generate module price-updater
    nest generate service price-updater
    ```
2.  Import the `@nestjs/schedule` module into `app.module.ts`:
    ```typescript
    // apps/api/src/app.module.ts
    import { ScheduleModule } from '@nestjs/schedule';
    // ...
    @Module({
      imports: [
        // ... other modules
        ScheduleModule.forRoot(),
        PriceUpdaterModule, // Ensure this is imported
      ],
      // ...
    })
    ```

#### Step 3: Implement the Price Updater Service

1.  **Define DTOs**: Create a DTO file `apps/api/src/price-updater/dto/fmp-quote.dto.ts` with a Zod schema to validate the FMP API response.
    ```typescript
    import { createZodDto } from 'nestjs-zod';
    import { z } from 'zod';

    const FmpQuoteSchema = z.array(
      z.object({
        symbol: z.string(),
        price: z.number(),
        // ... other fields if needed
      })
    );

    export class FmpQuoteDto extends createZodDto(FmpQuoteSchema) {}
    ```

2.  **Build the Service**: In `apps/api/src/price-updater/price-updater.service.ts`:
    - Inject `PrismaService` and the validated `ConfigService` (from `@repo/env`).
    - Create a method decorated with `@Cron('0 2 * * *')`.
    - Inside the Cron method, implement the logic defined in `contracts/price-updater.md`:
      - Fetch all unique `listings`.
      - Make a batch call to the FMP API using `axios`.
      - Validate the response with the `FmpQuoteSchema`.
      - Loop through the validated quotes and use `prisma.stockPrice.upsert` to update the database.
      - Add logging and error handling.

#### Step 4: Write an Integration Test

1.  In the `test/` directory, create a new test file for the `price-updater.service`.
2.  Write a test that mocks the FMP API response.
3.  Run the `updatePrices` method on the service.
4.  Assert that the `prisma.stockPrice` table in the test database has been correctly populated.

### Frontend Testing (`apps/web`)

1.  Once the backend service is running and the `stock_price` table is populated, run the `apps/web` application.
2.  Navigate to the "Dividends" page for a portfolio that has dividend-paying stocks.
3.  **Verify**: The "Dividend Yield Comparison" chart should now display bars for the "Trailing 12-Month Yield" that are not zero.
4.  **Verify**: Hovering over the bars and markers should show the correct percentage values in the tooltips.
