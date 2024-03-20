import { Injectable } from '@nestjs/common';
import { RegisterTokenDto } from './dto/register-token-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './entities/devices-token.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DevicesTokensService {
  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
  ) {}

  async registerToken(registerTokenDto: RegisterTokenDto , myuser:User): Promise<DeviceToken> {
    registerTokenDto.user = myuser;
    const deviceToken = this.deviceTokenRepository.create(registerTokenDto);
    return this.deviceTokenRepository.save(deviceToken);
  }


  findAll() {
    return `This action returns all devicesTokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} devicesToken`;
  }


  remove(id: number) {
    return `This action removes a #${id} devicesToken`;
  }
}
