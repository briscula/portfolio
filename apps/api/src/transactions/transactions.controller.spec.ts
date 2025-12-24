import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { UsersService } from '../users/users.service';
import { UnifiedAuthGuard } from '../auth/unified-auth.guard';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const mockTransactionsService = {
    create: jest.fn(),
    findByPortfolio: jest.fn(),
    findAll: jest.fn(),
  };

  const mockUsersService = {
    findByAuth0Sub: jest.fn(),
    createOrUpdateFromAuth0: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideGuard(UnifiedAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
