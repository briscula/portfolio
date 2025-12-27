-- CreateTable
CREATE TABLE "fx_rate" (
    "fromCurrency" VARCHAR(10) NOT NULL,
    "toCurrency" VARCHAR(10) NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "source" VARCHAR(50) NOT NULL DEFAULT 'yahoo_finance',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fx_rate_pkey" PRIMARY KEY ("fromCurrency","toCurrency")
);
