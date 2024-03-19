import { Injectable } from '@nestjs/common';
import { UpdateDevicesTokenDto } from './dto/update-devices-token.dto';
import { RegisterTokenDto } from './dto/register-token-dto';

@Injectable()
export class DevicesTokensService {
  create(createDevicesTokenDto: RegisterTokenDto) {
    return 'This action adds a new devicesToken';
  }

  findAll() {
    return `This action returns all devicesTokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} devicesToken`;
  }

  update(id: number, updateDevicesTokenDto: UpdateDevicesTokenDto) {
    return `This action updates a #${id} devicesToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} devicesToken`;
  }
}
