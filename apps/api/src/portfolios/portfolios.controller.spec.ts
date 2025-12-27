import { Test, TestingModule } from '@nestjs/testing';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { UsersService } from '../users/users.service';
import { PositionsService } from '../positions/positions.service';
import { TransactionsService } from '../transactions/transactions.service';
import { DividendAnalyticsService } from '../dividend-analytics/dividend-analytics.service';
import { UnifiedAuthGuard } from '../auth/unified-auth.guard';

describe('PortfoliosController', () => {
  let controller: PortfoliosController;

  const mockPortfoliosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsersService = {
    findByAuth0Sub: jest.fn(),
    createOrUpdateFromAuth0: jest.fn(),
  };

  const mockPositionsService = {
    getPortfolioPositions: jest.fn(),
    getPortfolioSummary: jest.fn(),
  };

  const mockTransactionsService = {
    create: jest.fn(),
    findByPortfolio: jest.fn(),
    getPortfolioTransactionsPagination: jest.fn(),
  };

  const mockDividendAnalyticsService = {
    getDividendSummary: jest.fn(),
    getMonthlyDividendOverview: jest.fn(),
    getHoldingsYieldComparison: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfoliosController],
      providers: [
        { provide: PortfoliosService, useValue: mockPortfoliosService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: PositionsService, useValue: mockPositionsService },
        { provide: TransactionsService, useValue: mockTransactionsService },
        {
          provide: DividendAnalyticsService,
          useValue: mockDividendAnalyticsService,
        },
      ],
    })
      .overrideGuard(UnifiedAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<PortfoliosController>(PortfoliosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
