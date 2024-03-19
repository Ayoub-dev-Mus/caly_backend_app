import { PartialType } from '@nestjs/swagger';
import { CreateDevicesTokenDto } from './create-devices-token.dto';

export class UpdateDevicesTokenDto extends PartialType(CreateDevicesTokenDto) {}
