/*
  Warnings:

  - You are about to drop the column `stockSymbol` on the `corporate_action` table. All the data in the column will be lost.
  - You are about to drop the column `stockSymbol` on the `stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `stockSymbol` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the `stock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "corporate_action" DROP CONSTRAINT "corporate_action_stockSymbol_fkey";

-- DropForeignKey
ALTER TABLE "stock_price" DROP CONSTRAINT "stock_price_stockSymbol_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_stockSymbol_fkey";

-- DropIndex
DROP INDEX "stock_price_stockSymbol_currencyCode_key";

-- DropIndex
DROP INDEX "transaction_portfolioId_stockSymbol_reference_key";

-- AlterTable
ALTER TABLE "corporate_action" DROP COLUMN "stockSymbol",
ADD COLUMN     "listingExchangeCode" VARCHAR(10),
ADD COLUMN     "listingIsin" VARCHAR(12);

-- AlterTable
ALTER TABLE "stock_price" DROP COLUMN "stockSymbol",
ADD COLUMN     "listingExchangeCode" VARCHAR(10),
ADD COLUMN     "listingIsin" VARCHAR(12);

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "stockSymbol",
ADD COLUMN     "listingExchangeCode" VARCHAR(10),
ADD COLUMN     "listingIsin" VARCHAR(12);

-- DropTable
DROP TABLE "stock";

-- AddForeignKey
ALTER TABLE "corporate_action" ADD CONSTRAINT "corporate_action_listingIsin_listingExchangeCode_fkey" FOREIGN KEY ("listingIsin", "listingExchangeCode") REFERENCES "listing"("isin", "exchangeCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_price" ADD CONSTRAINT "stock_price_listingIsin_listingExchangeCode_fkey" FOREIGN KEY ("listingIsin", "listingExchangeCode") REFERENCES "listing"("isin", "exchangeCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_listingIsin_listingExchangeCode_fkey" FOREIGN KEY ("listingIsin", "listingExchangeCode") REFERENCES "listing"("isin", "exchangeCode") ON DELETE SET NULL ON UPDATE CASCADE;
