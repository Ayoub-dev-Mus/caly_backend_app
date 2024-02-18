import { ApiProperty } from "@nestjs/swagger";
import { CreateTimeSlotDto } from "./create-timeslot.dto";
import { TimeSlot } from "../entities/timeslots.entity";

export class CreateAppointmentDto {

    @ApiProperty()
    date: Date;

    @ApiProperty()
    status: string;

    @ApiProperty()
    timeSlots: TimeSlot[];
}
