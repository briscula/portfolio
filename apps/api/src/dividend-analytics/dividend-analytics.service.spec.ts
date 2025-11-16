import { Test, TestingModule } from '@nestjs/testing';
import { DividendAnalyticsService } from './dividend-analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DividendAnalyticsService', () => {
  let service: DividendAnalyticsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DividendAnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DividendAnalyticsService>(DividendAnalyticsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMonthlyDividendOverview', () => {
    it('should return monthly dividend overview data', async () => {
      const mockData = [
        {
          year: '2023',
          month: '12',
          month_name: 'December',
          total_dividends: '1250.75',
          dividend_count: '8',
          companies: ['AAPL', 'MSFT'],
        },
      ];

      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue(mockData);

      const result = await service.getMonthlyDividendOverview(1, {});

      expect(result).toEqual({
        months: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        years: ['2023'],
        data: [
          {
            month: '12',
            monthName: 'December',
            yearlyData: [
              {
                year: '2023',
                totalDividends: 1250.75,
                dividendCount: 8,
                companies: ['AAPL', 'MSFT'],
              },
            ],
          },
        ],
      });
    });
  });

  describe('getCompanyDividendSummaries', () => {
    it('should return company dividend summaries with yield on cost', async () => {
      const mockData = [
        {
          stockSymbol: 'AAPL',
          companyName: 'Apple Inc.',
          year: '2023',
          total_dividends: '1250.75',
          dividend_count: '4',
          total_cost: '15000.00',
          yield_on_cost: '8.33',
          avg_dividend_per_payment: '312.69',
        },
      ];

      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue(mockData);

      const result = await service.getCompanyDividendSummaries(1, {});

      expect(result).toEqual([
        {
          stockSymbol: 'AAPL',
          companyName: 'Apple Inc.',
          year: 2023,
          totalDividends: 1250.75,
          dividendCount: 4,
          totalCost: 15000.0,
          yieldOnCost: 8.33,
          averageDividendPerPayment: 312.69,
        },
      ]);
    });
  });
});
