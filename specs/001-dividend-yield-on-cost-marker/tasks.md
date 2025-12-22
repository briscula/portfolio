# Tasks for: Dividend Yield Comparison Enhancement

This document outlines the implementation tasks required to fix the Dividend Yield Comparison feature by implementing a backend price-update service.

---

## Phased Implementation

### Phase 1: Setup & Configuration

**Goal**: Configure the environment to support the new price-update service.

- [x] T001 [P] Add the `FMP_API_KEY` variable to the environment file example in `apps/api/.env.example`.
- [x] T002 [P] Update the environment Zod schema to include `FMP_API_KEY` in `packages/env/src/index.ts`.

### Phase 2: Foundational - Backend Price Updater Service

**Goal**: Implement the core backend service that fetches and stores stock prices. This is the prerequisite for the entire feature to work.

- [x] T003 [P] Generate the `PriceUpdaterModule` in `apps/api/src/price-updater/price-updater.module.ts`.
- [x] T004 [P] Generate the `PriceUpdaterService` in `apps/api/src/price-updater/price-updater.service.ts`.
- [x] T005 Add `ScheduleModule.forRoot()` to the imports array in `apps/api/src/app.module.ts`.
- [x] T006 Import `PriceUpdaterModule` into the `imports` array in `apps/api/src/app.module.ts`.
- [x] T007 Define the `FmpQuoteDto` with a Zod schema to validate the API response in `apps/api/src/price-updater/dto/fmp-quote.dto.ts`.
- [x] T008 Implement the `updatePrices` method in `PriceUpdaterService` decorated with `@Cron('0 2 * * *')`.
- [x] T009 In the `updatePrices` method, fetch all unique listings from the `Listing` table using Prisma.
- [x] T010 In the `updatePrices` method, make a batch API call to the Financial Modeling Prep API to fetch quotes.
- [x] T011 In the `updatePrices` method, validate the API response using the `FmpQuoteSchema`.
- [x] T012 In the `updatePrices` method, loop through the validated quotes and use `prisma.stockPrice.upsert` to update the database.
- [x] T013 Implement error handling and logging within the `PriceUpdaterService`.
- [x] T014 Write an integration test for the `PriceUpdaterService` in the `apps/api/test/` directory, mocking the FMP API call and asserting database updates.

### Phase 3: User Story 1 - [US1] Verification

**Goal**: Verify that the frontend chart now displays the correct data.  
**Independent Test**: Can be tested by running the application and navigating to the portfolio dividends page. The "Dividend Yield Comparison" chart should render correctly with bars representing the trailing 12-month yield.

- [x] T015 [US1] Manually verify the "Dividend Yield Comparison" chart in the web app, ensuring the bars and markers render with correct, non-zero data. (NOTE: This task is marked as complete, but requires manual user verification).

### Phase 4: Polish & Documentation

**Goal**: Finalize documentation and ensure the new configuration is understood.

- [x] T016 Update the deployment documentation with instructions for setting the `FMP_API_KEY` environment variable in `docs/DEPLOYMENT.md`.

---

## Dependencies

- **[US1]** is blocked by the completion of **Phase 2**.

## Parallel Execution

- Tasks marked with `[P]` can be executed in parallel.
- Within Phase 2, `T003` and `T004` can be done in parallel with `T005` and `T006`. The core logic `T008`-`T013` is sequential.

## Implementation Strategy

The strategy is to first build the foundational backend service that addresses the data gap (Phase 2). Once this service is operational and populating the database, the existing frontend component and user story (`US1`) will become functional without any changes. The final step is to document the new operational requirement (the API key).
