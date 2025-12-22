# Contract: Price Updater Scheduled Job

**Status**: Defined

This document describes the contract and behavior of the internal `PriceUpdaterService`, which runs as a scheduled job.

## 1. Service Responsibility

The `PriceUpdaterService` is responsible for keeping the `stock_price` table populated and up-to-date with the latest market prices for all unique listings held in user portfolios.

## 2. Trigger and Schedule

- **Trigger**: The service method `runPriceUpdate()` is exposed via a dedicated API endpoint (POST /price-updater/run) that can be called by an external scheduler (e.g., a cron job, a serverless function, or manual trigger).
- **Technology**: The scheduling is external to the NestJS application.
- **Schedule**: The frequency of execution is determined by the external scheduler. For daily updates, an external cron job running at `0 2 * * *` (Every day at 2:00 AM UTC) is recommended.
- **Rationale**: This approach decouples the scheduling logic from the application, resolving persistent TypeScript compilation issues related to `@nestjs/schedule` in the monorepo.

## 4. Dependencies

- `axios` (or similar): For making HTTP requests to the FMP API.
- `@repo/env`: To securely access the `FMP_API_KEY`.
- `PrismaService`: To interact with the database.
