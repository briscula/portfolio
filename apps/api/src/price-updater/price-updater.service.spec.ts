import { Test, TestingModule } from '@nestjs/testing';
import { PriceUpdaterService } from './price-updater.service';

describe('PriceUpdaterService', () => {
  let service: PriceUpdaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceUpdaterService],
    }).compile();

    service = module.get<PriceUpdaterService>(PriceUpdaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
