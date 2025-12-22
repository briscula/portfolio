# Data Model: Stock Price

**Status**: Defined

This document outlines the data structure for the `stock_price` table, which is essential for calculating the `trailing12MonthYield`.

## `stock_price` Table

This table stores the most recent price for a given financial listing. It is populated by a scheduled job that fetches data from a third-party provider.

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | Unique identifier for the price record. |
| `listingIsin` | `String` | | The ISIN of the listing. Part of a compound foreign key. |
| `listingExchangeCode` | `String` | | The exchange code of the listing. Part of a compound foreign key. |
| `price` | `Decimal` | | The most recently fetched price of the listing. |
| `currencyCode` | `String` | | The currency of the price. |
| `lastUpdated` | `DateTime` | `@updatedAt` | Timestamp of when the record was last updated. |
| `listing` | `Listing` | `relation(...)` | Foreign key relationship to the `Listing` table. |

### Prisma Schema Definition

```prisma
model StockPrice {
  id                  String   @id @default(cuid())
  listingIsin         String
  listingExchangeCode String
  price               Decimal
  currencyCode        String
  lastUpdated         DateTime @updatedAt

  listing             Listing  @relation(fields: [listingIsin, listingExchangeCode], references: [isin, exchangeCode], onDelete: Cascade)

  @@unique([listingIsin, listingExchangeCode])
  @@map("stock_price")
}
```

### State Transitions

- **Creation**: A new record is created when the price updater service runs for the first time for a specific listing.
- **Update**: The `price`, `currencyCode`, and `lastUpdated` fields are updated on every subsequent successful run of the price updater service for that listing.
- **Deletion**: Records are deleted if the corresponding `Listing` is deleted, due to the `onDelete: Cascade` constraint.
