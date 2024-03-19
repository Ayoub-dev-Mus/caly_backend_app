import { Injectable } from '@nestjs/common';
import { UpdateDevicesTokenDto } from './dto/update-devices-token.dto';
import { RegisterTokenDto } from './dto/register-token-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './entities/devices-token.entity';

@Injectable()
export class DevicesTokensService {
  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
  ) {}

  async registerToken(registerTokenDto: RegisterTokenDto): Promise<DeviceToken> {
    const { token, user } = registerTokenDto;
    const deviceToken = this.deviceTokenRepository.create({ token, user });
    return this.deviceTokenRepository.save(deviceToken);
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
