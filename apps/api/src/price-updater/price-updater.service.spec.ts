import { Test, TestingModule } from '@nestjs/testing';
import { PriceUpdaterService } from './price-updater.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PriceUpdaterService', () => {
  let service: PriceUpdaterService;

  const mockPrismaService = {
    listing: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceUpdaterService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PriceUpdaterService>(PriceUpdaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle empty listings', async () => {
    mockPrismaService.listing.findMany.mockResolvedValue([]);

    await service.runPriceUpdate();

    expect(mockPrismaService.listing.findMany).toHaveBeenCalled();
    expect(mockPrismaService.listing.update).not.toHaveBeenCalled();
  });
});
