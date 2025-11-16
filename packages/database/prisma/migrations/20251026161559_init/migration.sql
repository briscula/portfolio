-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('AUTH0', 'EMAIL_PASSWORD');

-- CreateEnum
CREATE TYPE "public"."CorporateActionType" AS ENUM ('SPLIT', 'SPINOFF', 'MERGER');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('DIVIDEND', 'BUY', 'SELL', 'TAX', 'CASH_DEPOSIT', 'CASH_WITHDRAWAL');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."portfolio" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "currencyCode" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."currency" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "symbol" VARCHAR(5) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "public"."stock" (
    "symbol" VARCHAR(10) NOT NULL,
    "companyName" VARCHAR(255),
    "sector" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "public"."corporate_action" (
    "id" SERIAL NOT NULL,
    "stockSymbol" VARCHAR(10) NOT NULL,
    "type" "public"."CorporateActionType" NOT NULL,
    "executionDate" TIMESTAMP(3) NOT NULL,
    "factor" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stock_price" (
    "id" SERIAL NOT NULL,
    "stockSymbol" VARCHAR(10) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currencyCode" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(50),

    CONSTRAINT "stock_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction" (
    "id" SERIAL NOT NULL,
    "portfolioId" UUID NOT NULL,
    "stockSymbol" VARCHAR(10) NOT NULL,
    "type" "public"."TransactionType" NOT NULL DEFAULT 'BUY',
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currencyCode" VARCHAR(10) NOT NULL,
    "notes" TEXT,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reference" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_auth_account" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "public"."AuthProvider" NOT NULL,
    "providerSub" VARCHAR(255) NOT NULL,
    "providerEmail" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_auth_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_positions" (
    "userId" UUID NOT NULL,
    "portfolioId" UUID NOT NULL,
    "portfolioName" TEXT NOT NULL,
    "stockSymbol" TEXT NOT NULL,
    "companyName" TEXT,
    "sector" TEXT,
    "currentQuantity" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "totalDividends" DOUBLE PRECISION NOT NULL,
    "dividendCount" INTEGER NOT NULL,
    "lastTransactionDate" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_userId_name_key" ON "public"."portfolio"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "stock_symbol_key" ON "public"."stock"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "stock_price_stockSymbol_currencyCode_key" ON "public"."stock_price"("stockSymbol", "currencyCode");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_portfolioId_stockSymbol_createdAt_quantity_refe_key" ON "public"."transaction"("portfolioId", "stockSymbol", "createdAt", "quantity", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_account_provider_providerSub_key" ON "public"."user_auth_account"("provider", "providerSub");

-- CreateIndex
CREATE UNIQUE INDEX "user_positions_userId_portfolioId_stockSymbol_key" ON "public"."user_positions"("userId", "portfolioId", "stockSymbol");

-- AddForeignKey
ALTER TABLE "public"."portfolio" ADD CONSTRAINT "portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."portfolio" ADD CONSTRAINT "portfolio_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "public"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corporate_action" ADD CONSTRAINT "corporate_action_stockSymbol_fkey" FOREIGN KEY ("stockSymbol") REFERENCES "public"."stock"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_price" ADD CONSTRAINT "stock_price_stockSymbol_fkey" FOREIGN KEY ("stockSymbol") REFERENCES "public"."stock"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_price" ADD CONSTRAINT "stock_price_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "public"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "public"."portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_stockSymbol_fkey" FOREIGN KEY ("stockSymbol") REFERENCES "public"."stock"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "public"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_auth_account" ADD CONSTRAINT "user_auth_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
