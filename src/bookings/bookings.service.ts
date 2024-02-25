import { Injectable, Logger } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BookingsService {

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>
  ) { }

  async create(createBookingDto: CreateBookingDto, user: User) {
    createBookingDto.user = user;
    Logger.log(createBookingDto);
    const newBooking = this.bookingRepository.create(createBookingDto);
    return await this.bookingRepository.save(newBooking);
  }

  async findAll(user: User, options?: FindManyOptions<Booking>,) {
    return await this.bookingRepository.find({
      relations: ["specialist", "service", "store", "timeSlot", "user"],
      where: {
        user: { id: user.id }
      },
      ...options,
    });
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
