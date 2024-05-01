import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { TimeSlot } from './entities/timeslots.entity';
import { Repository } from 'typeorm';
import { CreateTimeSlotDto } from './dto/create-timeslot.dto';
import { UpdateTimeSlotDto } from './dto/update-timeslot.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
  ) { }

  // Appointments CRUD

  async createAppointment(createAppointmentDto: CreateAppointmentDto) {
    const appointment = this.appointmentRepository.create(createAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async findAllAppointments() {
    return this.appointmentRepository.find();
  }

  async findAppointmentsByDateAndStore(date: Date, storeId: number) { }

  async findOneAppointment(id: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['timeSlots'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async updateAppointment(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ) {
    const existingAppointment = await this.findOneAppointment(id);
    this.appointmentRepository.merge(existingAppointment, updateAppointmentDto);
    return this.appointmentRepository.save(existingAppointment);
  }

  async removeAppointment(id: number) {
    const appointment = await this.findOneAppointment(id);
    return this.appointmentRepository.remove(appointment);
  }

  // TimeSlots CRUD

  async createTimeSlot(createTimeSlotDto: CreateTimeSlotDto) {
    const timeSlot = this.timeSlotRepository.create(createTimeSlotDto);
    return this.timeSlotRepository.save(timeSlot);
  }

  async findAllTimeSlots() {
    return this.timeSlotRepository.find();
  }

  async findTimeSlotsByDateAndStore(
    date: Date,
    storeId: number,
  ): Promise<TimeSlot[]> {
    const timeSlots = await this.timeSlotRepository.find({
      where: { date, store: { id: storeId } },
    });
    return timeSlots;
  }

  async findOneTimeSlot(id: number) {
    const timeSlot = await this.timeSlotRepository.findOne({
      where: { id },
      relations: ['appointment'],
    });
    if (!timeSlot) {
      throw new NotFoundException(`Time slot with ID ${id} not found`);
    }
    return timeSlot;
  }

  async updateTimeSlot(id: number, updateTimeSlotDto: UpdateTimeSlotDto) {
    const existingTimeSlot = await this.findOneTimeSlot(id);
    this.timeSlotRepository.merge(existingTimeSlot, updateTimeSlotDto);
    return this.timeSlotRepository.save(existingTimeSlot);
  }

  async removeTimeSlot(id: number) {
    const timeSlot = await this.findOneTimeSlot(id);
    return this.timeSlotRepository.remove(timeSlot);
  }
}
