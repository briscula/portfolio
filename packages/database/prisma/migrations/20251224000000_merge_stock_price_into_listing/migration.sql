-- Merge StockPrice into Listing table

-- Step 1: Add new columns to listing table
ALTER TABLE "listing" ADD COLUMN "currentPrice" DOUBLE PRECISION;
ALTER TABLE "listing" ADD COLUMN "priceLastUpdated" TIMESTAMP(3);
ALTER TABLE "listing" ADD COLUMN "priceSource" VARCHAR(50);

-- Step 2: Migrate data from stock_price to listing
UPDATE "listing" l
SET
    "currentPrice" = sp.price,
    "priceLastUpdated" = sp."lastUpdated",
    "priceSource" = sp.source
FROM "stock_price" sp
WHERE l.isin = sp."listingIsin"
  AND l."exchangeCode" = sp."listingExchangeCode";

-- Step 3: Drop the stock_price table
DROP TABLE "stock_price";
