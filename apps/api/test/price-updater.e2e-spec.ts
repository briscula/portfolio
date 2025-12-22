import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { PriceUpdaterService } from '../src/price-updater/price-updater.service';
import { PriceUpdaterModule } from '../src/price-updater/price-updater.module';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PriceUpdaterService (Integration)', () => {
  let app: INestApplication;
  let priceUpdaterService: PriceUpdaterService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PriceUpdaterModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    priceUpdaterService = app.get<PriceUpdaterService>(PriceUpdaterService);
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear the test database before each test
    await prisma.stockPrice.deleteMany({});
    await prisma.listing.deleteMany({});
  });

  it('should fetch prices and update the database', async () => {
    // 1. Setup: Create a listing in the test database
    await prisma.listing.create({
      data: {
        isin: 'US0378331005',
        exchangeCode: 'XNAS',
        tickerSymbol: 'AAPL',
        companyName: 'Apple Inc.',
        currencyCode: 'USD',
      },
    });

    // 2. Mock: Mock the FMP API response
    const mockFmpResponse = [
      {
        symbol: 'AAPL',
        price: 175.5,
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockFmpResponse });

    // 3. Act: Manually trigger the private updatePrices method
    // We are testing the private method directly for simplicity here.
    await (priceUpdaterService as any).updatePrices();

    // 4. Assert: Check if the stock_price table was updated
    const stockPrice = await prisma.stockPrice.findFirst({
      where: {
        listingIsin: 'US0378331005',
      },
    });

    expect(stockPrice).not.toBeNull();
    expect(stockPrice?.price).toEqual(175.5);
    expect(stockPrice?.currencyCode).toEqual('USD');
  });
});
