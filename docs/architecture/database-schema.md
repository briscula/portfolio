# Database Schema

## Overview

This document describes the database schema for the Portfolio application, including models, relationships, and key business rules enforced at the database level.

**Database**: PostgreSQL
**ORM**: Prisma
**Schema Location**: `packages/database/prisma/schema.prisma`

---

## Core Models

### User
Represents authenticated users who can own multiple portfolios.

**Key Fields**:
- `id` (UUID) - Primary key
- `email` (String, unique) - User's email address
- `name` (String) - User's display name
- `password` (String) - Hashed password

**Relations**:
- `portfolios` → One-to-many with Portfolio
- `authAccounts` → One-to-many with UserAuthAccount

---

### Portfolio
Represents an investment portfolio owned by a user.

**Key Fields**:
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to User
- `name` (String) - Portfolio name
- `description` (String, optional) - Portfolio description
- `currencyCode` (String) - Base currency (default: "USD")

**Relations**:
- `user` → Many-to-one with User
- `currency` → Many-to-one with Currency
- `transactions` → One-to-many with Transaction

**Constraints**:
- `@@unique([userId, name])` - Each user must have unique portfolio names

---

### Transaction
Represents a financial transaction (buy, sell, dividend, etc.) within a portfolio.

**Key Fields**:
- `id` (Int) - Primary key (auto-increment)
- `portfolioId` (UUID) - Foreign key to Portfolio
- `stockSymbol` (String) - Stock ticker symbol
- `type` (TransactionType) - Type of transaction (BUY, SELL, DIVIDEND, TAX, etc.)
- `quantity` (Float) - Number of shares
- `price` (Float) - Price per share
- `commission` (Float) - Transaction commission
- `currencyCode` (String) - Transaction currency
- `reference` (String, optional) - Unique transaction reference
- `amount` (Float) - Total transaction amount (quantity × price)
- `totalAmount` (Float) - Total including fees/taxes
- `tax` (Float) - Tax amount
- `taxPercentage` (Float) - Tax percentage
- `notes` (String, optional) - Additional notes
- `createdAt` (DateTime) - Transaction date

**Relations**:
- `portfolio` → Many-to-one with Portfolio
- `stock` → Many-to-one with Stock
- `currency` → Many-to-one with Currency

**Constraints**:
```prisma
@@unique([portfolioId, stockSymbol, reference])
```

#### Transaction Equality Criteria

A transaction is considered **equal (duplicate)** when all of these fields match an existing transaction:

1. **`portfolioId`** - Same portfolio
2. **`stockSymbol`** - Same stock ticker
3. **`reference`** - Same transaction reference

**Why these fields?**
- **Simplified from original constraint**: Previously included `createdAt` and `quantity`, which was too restrictive
- **`reference` field**: Serves as the primary unique identifier within a portfolio/stock combination
- **Default reference generation**: If not provided, the reference is auto-generated from date + symbol + quantity (see `transactions.service.ts:60-66`)

**Example**:
```typescript
// These two transactions would be considered duplicates:
const tx1 = {
  portfolioId: "abc-123",
  stockSymbol: "AAPL",
  reference: "2024-01-15 AAPL 10",
  // ... other fields
};

const tx2 = {
  portfolioId: "abc-123",
  stockSymbol: "AAPL",
  reference: "2024-01-15 AAPL 10",
  // ... other fields (can be different)
};
```

**Related Files**:
- Schema: `packages/database/prisma/schema.prisma:161`
- Service: `apps/api/src/transactions/transactions.service.ts:60-66`

---

### Stock
Represents a publicly traded stock.

**Key Fields**:
- `symbol` (String) - Stock ticker symbol (primary key)
- `companyName` (String, optional) - Company name
- `sector` (String, optional) - Business sector

**Relations**:
- `transactions` → One-to-many with Transaction
- `prices` → One-to-many with StockPrice
- `corporateActions` → One-to-many with CorporateAction

---

### Currency
Represents a currency type used in portfolios and transactions.

**Key Fields**:
- `code` (String) - Currency code (e.g., "USD", "EUR") - Primary key
- `name` (String) - Currency name (e.g., "US Dollar")
- `symbol` (String) - Currency symbol (e.g., "$", "€")

**Relations**:
- `portfolios` → One-to-many with Portfolio
- `transactions` → One-to-many with Transaction
- `stockPrices` → One-to-many with StockPrice

---

### StockPrice
Represents historical or current stock prices.

**Key Fields**:
- `id` (Int) - Primary key (auto-increment)
- `stockSymbol` (String) - Foreign key to Stock
- `price` (Float) - Stock price
- `currencyCode` (String) - Price currency
- `lastUpdated` (DateTime) - When price was updated
- `source` (String, optional) - Data source (e.g., "alpha_vantage", "yahoo")

**Constraints**:
- `@@unique([stockSymbol, currencyCode])` - One price per stock per currency

---

### CorporateAction
Represents corporate actions like stock splits, spinoffs, and mergers.

**Key Fields**:
- `id` (Int) - Primary key (auto-increment)
- `stockSymbol` (String) - Foreign key to Stock
- `type` (CorporateActionType) - Type of action (SPLIT, SPINOFF, MERGER)
- `executionDate` (DateTime) - When action was executed
- `factor` (Float, optional) - Action factor (e.g., split ratio)
- `notes` (String, optional) - Additional details

---

### UserAuthAccount
Represents authentication accounts linked to a user (Auth0, email/password, etc.).

**Key Fields**:
- `id` (Int) - Primary key (auto-increment)
- `userId` (UUID) - Foreign key to User
- `provider` (AuthProvider) - Auth provider (AUTH0, EMAIL_PASSWORD)
- `providerSub` (String) - Provider's user ID
- `providerEmail` (String, optional) - Email from provider
- `isActive` (Boolean) - Whether account is active
- `lastUsedAt` (DateTime, optional) - Last login time

**Constraints**:
- `@@unique([provider, providerSub])` - One account per provider per user

---

### UserPosition (View)
Materialized view or computed table showing aggregated positions per user/portfolio/stock.

**Key Fields**:
- `userId` (UUID)
- `portfolioId` (UUID)
- `stockSymbol` (String)
- `currentQuantity` (Float) - Current share count
- `totalCost` (Float) - Total cost basis
- `totalDividends` (Float) - Total dividends received
- `dividendCount` (Int) - Number of dividend payments
- `lastTransactionDate` (DateTime)

**Constraints**:
- `@@unique([userId, portfolioId, stockSymbol])` - One position per user/portfolio/stock

---

## Enums

### TransactionType
```prisma
enum TransactionType {
  DIVIDEND
  BUY
  SELL
  TAX
  CASH_DEPOSIT
  CASH_WITHDRAWAL
}
```

### CorporateActionType
```prisma
enum CorporateActionType {
  SPLIT
  SPINOFF
  MERGER
}
```

### AuthProvider
```prisma
enum AuthProvider {
  AUTH0
  EMAIL_PASSWORD
}
```

---

## Database Migrations

To apply schema changes:

```bash
# Create and apply migration
pnpm --filter @repo/database db:migrate

# Generate Prisma client
pnpm --filter @repo/database db:generate

# Open Prisma Studio (database GUI)
pnpm --filter @repo/database db:studio
```

---

## Key Business Rules

### 1. Transaction Uniqueness
Transactions are identified by the combination of `portfolioId`, `stockSymbol`, and `reference`. This prevents duplicate transactions while allowing flexibility for multiple transactions of the same stock on the same date with different quantities.

### 2. Portfolio Naming
Each user must have unique portfolio names within their account, enforced by the `@@unique([userId, name])` constraint.

### 3. Stock Price Uniqueness
Each stock can only have one price entry per currency, enforced by `@@unique([stockSymbol, currencyCode])`.

### 4. Auth Account Uniqueness
Each authentication provider can only have one account per user, enforced by `@@unique([provider, providerSub])`.

---

## Related Documentation

- [API Authentication](./API_AUTHENTICATION.md) - Authentication implementation details
- [System Architecture](./system-architecture.md) - Overall system design
- [API Product Requirements](../product/API_PRD.md) - Product specifications

---

**Last Updated**: 2024-12-04
**Schema Version**: See latest migration in `packages/database/prisma/migrations/`
