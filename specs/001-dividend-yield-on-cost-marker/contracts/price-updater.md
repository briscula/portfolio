# Contract: Price Updater Scheduled Job

**Status**: Defined

This document describes the contract and behavior of the internal `PriceUpdaterService`, which runs as a scheduled job.

## 1. Service Responsibility

The `PriceUpdaterService` is responsible for keeping the `stock_price` table populated and up-to-date with the latest market prices for all unique listings held in user portfolios.

## 2. Trigger and Schedule

- **Trigger**: The service is triggered automatically by a scheduler.
- **Technology**: It will be implemented using the `@nestjs/schedule` module.
- **Schedule**: The job will run on a `Cron` schedule.
- **Cron String**: `0 2 * * *` (Every day at 2:00 AM UTC).
- **Rationale**: This schedule ensures that prices are updated daily, providing fresh data for the TTM Yield calculation, while running during off-peak hours to minimize load.

## 3. Data Flow and Logic

1.  **Fetch Unique Listings**: The service will query the `Listing` table to get a distinct list of all listings that exist in user portfolios.
2.  **Batch API Requests**: It will batch these listings into requests to the Financial Modeling Prep (FMP) API to efficiently fetch multiple quotes at once.
3.  **Validate Responses**: The JSON response from the FMP API will be validated against a Zod schema to ensure type safety and data integrity before being processed.
4.  **Update Database**: For each valid price received, the service will perform an `upsert` operation on the `stock_price` table:
    - If a record for the `listingIsin` and `listingExchangeCode` already exists, it will `UPDATE` the `price`, `currencyCode`, and `lastUpdated` fields.
    - If no record exists, it will `INSERT` a new row.
5.  **Error Handling**:
    - The service will gracefully handle API errors (e.g., rate limiting, invalid tickers) from FMP.
    - It will log any validation errors or failed database operations.
    - The job will not halt on single-ticker errors but will attempt to process the entire batch.

## 4. Dependencies

- `@nestjs/schedule`: For `Cron` job scheduling.
- `axios` (or similar): For making HTTP requests to the FMP API.
- `@repo/env`: To securely access the `FMP_API_KEY`.
- `PrismaService`: To interact with the database.
