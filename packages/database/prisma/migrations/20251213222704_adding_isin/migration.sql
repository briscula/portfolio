/*
  Warnings:

  - A unique constraint covering the columns `[isin]` on the table `stock` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "stock" ADD COLUMN     "isin" VARCHAR(12);

-- CreateIndex
CREATE UNIQUE INDEX "stock_isin_key" ON "stock"("isin");
