import { Test, TestingModule } from '@nestjs/testing';
import { DevicesTokensController } from './devices-tokens.controller';
import { DevicesTokensService } from './devices-tokens.service';

describe('DevicesTokensController', () => {
  let controller: DevicesTokensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesTokensController],
      providers: [DevicesTokensService],
    }).compile();

    controller = module.get<DevicesTokensController>(DevicesTokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
