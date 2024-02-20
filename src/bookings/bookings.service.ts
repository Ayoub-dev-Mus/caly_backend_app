import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>
  ) { }

  async create(createBookingDto: CreateBookingDto) {
    const newBooking = this.bookingRepository.create(createBookingDto);
    return await this.bookingRepository.save(newBooking);
  }

  async findAll() {
    return await this.bookingRepository.find({ relations: ["specialist", "service", "store" , "timeSlot"] });
  }

  async findOne(id: number) {
    return await this.bookingRepository.findOne({ where: { id } });
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    const updatedBooking = await this.bookingRepository.preload({
      id,
      ...updateBookingDto,
    });
    if (!updatedBooking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    return await this.bookingRepository.save(updatedBooking);
  }

  async remove(id: number) {
    const bookingToRemove = await this.findOne(id);
    return await this.bookingRepository.remove(bookingToRemove);
  }
}
