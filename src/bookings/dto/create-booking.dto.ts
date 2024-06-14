import { TimeSlot } from 'src/appointments/entities/timeslots.entity';
import { Service } from 'src/services/entities/service.entity';
import { Specialist } from 'src/specialists/entities/specialist.entity';
import { Store } from 'src/stores/entities/store.entity';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { BookingStatus } from '../enum/booking.status';

export class CreateBookingDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => TimeSlot)
  timeSlot: TimeSlot;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Store)
  store: Store;


  @ApiProperty()
  status: BookingStatus;



  @ApiProperty()
  @ValidateNested()
  @Type(() => Specialist)
  specialist: Specialist;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Service)
  service: Service;

  @ApiProperty()
  user: User;
}
