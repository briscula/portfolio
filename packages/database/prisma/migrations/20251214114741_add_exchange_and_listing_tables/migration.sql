/*
  Warnings:

  - You are about to drop the column `isin` on the `stock` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "stock_isin_key";

-- AlterTable
ALTER TABLE "stock" DROP COLUMN "isin";

-- CreateTable
CREATE TABLE "exchange" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "listing" (
    "isin" VARCHAR(12) NOT NULL,
    "exchangeCode" VARCHAR(10) NOT NULL,
    "tickerSymbol" VARCHAR(10) NOT NULL,
    "companyName" VARCHAR(255),
    "currencyCode" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_pkey" PRIMARY KEY ("isin","exchangeCode")
);

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_exchangeCode_fkey" FOREIGN KEY ("exchangeCode") REFERENCES "exchange"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
