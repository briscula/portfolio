/*
  Warnings:

  - You are about to drop the column `cost` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `netCost` on the `transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "cost",
DROP COLUMN "netCost",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
