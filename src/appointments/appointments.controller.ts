import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CreateTimeSlotDto } from './dto/create-timeslot.dto';
import { UpdateTimeSlotDto } from './dto/update-timeslot.dto';
import { ApiTags } from '@nestjs/swagger';
import { TimeSlot } from './entities/timeslots.entity';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(createAppointmentDto);
  }

  @Get('/timeslots')
  async findTimeSlotsByDateAndStore(
    @Query('date') date: Date,
    @Query('storeId') storeId: number,
  ): Promise<TimeSlot[]> {
    return this.appointmentsService.findTimeSlotsByDateAndStore(date, storeId);
  }

  @Get()
  findAllAppointments() {
    return this.appointmentsService.findAllAppointments();
  }

  @Get(':id')
  findOneAppointment(@Param('id') id: string) {
    return this.appointmentsService.findOneAppointment(+id);
  }

  @Patch(':id')
  updateAppointment(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.updateAppointment(+id, updateAppointmentDto);
  }

  @Delete(':id')
  removeAppointment(@Param('id') id: string) {
    return this.appointmentsService.removeAppointment(+id);
  }

  @Post('/timeslots')
  createTimeSlot(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return this.appointmentsService.createTimeSlot(createTimeSlotDto);
  }

  @Get('/timeslots')
  findAllTimeSlots() {
    return this.appointmentsService.findAllTimeSlots();
  }

  @Get('/timeslots/:id')
  findOneTimeSlot(@Param('id') id: string) {
    return this.appointmentsService.findOneTimeSlot(+id);
  }

  @Patch('/timeslots/:id')
  updateTimeSlot(@Param('id') id: string, @Body() updateTimeSlotDto: UpdateTimeSlotDto) {
    return this.appointmentsService.updateTimeSlot(+id, updateTimeSlotDto);
  }

  @Delete('/timeslots/:id')
  removeTimeSlot(@Param('id') id: string) {
    return this.appointmentsService.removeTimeSlot(+id);
  }
}
