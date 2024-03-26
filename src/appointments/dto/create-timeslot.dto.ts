import { ApiProperty } from '@nestjs/swagger';
import { Store } from 'src/stores/entities/store.entity';

export class CreateTimeSlotDto {
  @ApiProperty()
  time: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  available: boolean;

  @ApiProperty()
  store: Store;
}
