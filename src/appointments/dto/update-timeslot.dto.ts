import { ApiProperty } from '@nestjs/swagger';
import { Appointment } from '../entities/appointment.entity';

export class UpdateTimeSlotDto {
  @ApiProperty()
  time: string;

  @ApiProperty()
  available: boolean;

  @ApiProperty()
  appointment: Appointment;
}
