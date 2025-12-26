-- CreateEnum
CREATE TYPE "DividendFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'IRREGULAR');

-- CreateTable
CREATE TABLE "dividend_info" (
    "listingIsin" VARCHAR(12) NOT NULL,
    "listingExchangeCode" VARCHAR(10) NOT NULL,
    "frequency" "DividendFrequency",
    "avgAmount" DOUBLE PRECISION,
    "lastPaymentDate" TIMESTAMP(3),
    "nextExDate" TIMESTAMP(3),
    "nextPaymentDate" TIMESTAMP(3),
    "nextAmount" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dividend_info_pkey" PRIMARY KEY ("listingIsin","listingExchangeCode")
);

-- AddForeignKey
ALTER TABLE "dividend_info" ADD CONSTRAINT "dividend_info_listingIsin_listingExchangeCode_fkey" FOREIGN KEY ("listingIsin", "listingExchangeCode") REFERENCES "listing"("isin", "exchangeCode") ON DELETE RESTRICT ON UPDATE CASCADE;
