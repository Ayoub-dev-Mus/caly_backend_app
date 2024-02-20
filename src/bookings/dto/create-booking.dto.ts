import { TimeSlot } from 'src/appointments/entities/timeslots.entity';
import { Service } from 'src/services/entities/service.entity';
import { Specialist } from 'src/specialists/entities/specialist.entity';
import { Store } from 'src/stores/entities/store.entity';
import { IsNotEmpty, IsNumber, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


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
    @ValidateNested()
    @Type(() => Specialist)
    specialist: Specialist;


    @ApiProperty()
    @ValidateNested()
    @Type(() => Service)
    service: Service;
}
