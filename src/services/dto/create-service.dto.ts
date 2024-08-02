import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Store } from 'src/stores/entities/store.entity';
import { Specialist } from 'src/specialists/entities/specialist.entity';
import { Status } from '../enum/status';

@ApiExtraModels(Store, Specialist)
export class CreateServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsNotEmpty()
  @IsString()
  status: Status;

  @ApiProperty({ type: Store })
  @IsNotEmpty()
  @IsArray()
  @Type(() => Store)
  store: Store;

  @ApiProperty({ type: [Specialist] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Specialist)
  specialists: Specialist[];
}

export default CreateServiceDto;
