/*
  Warnings:

  - A unique constraint covering the columns `[portfolioId,stockSymbol,reference]` on the table `transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "transaction_portfolioId_stockSymbol_createdAt_quantity_refe_key";

-- CreateIndex
CREATE UNIQUE INDEX "transaction_portfolioId_stockSymbol_reference_key" ON "transaction"("portfolioId", "stockSymbol", "reference");
