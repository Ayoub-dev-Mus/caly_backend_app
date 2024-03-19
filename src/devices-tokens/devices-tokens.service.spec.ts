import { Test, TestingModule } from '@nestjs/testing';
import { DevicesTokensService } from './devices-tokens.service';

describe('DevicesTokensService', () => {
  let service: DevicesTokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicesTokensService],
    }).compile();

    service = module.get<DevicesTokensService>(DevicesTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
