import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreTypeDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  icon: string;
}
