import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, ILike, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BookingsService {

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>
  ) { }

  async create(createBookingDto: CreateBookingDto, user: User) {
    try {
      createBookingDto.user = user;
      Logger.log(createBookingDto);
      const newBooking = this.bookingRepository.create(createBookingDto);
      return await this.bookingRepository.save(newBooking);
    } catch (error) {
      // Log the error or handle it accordingly
      Logger.error(`Error creating booking: ${error.message}`);
      throw new Error(`Error creating booking: ${error.message}`);
    }
  }

  async findAll(user: User, createdAt?: Date, storeName?: string, options?: FindManyOptions<Booking>) {
    try {
      let whereClause: any = {
        user: { id: user.id }
      };

      if (createdAt) {
        // Adjust to consider the entire day
        const startOfDay = new Date(createdAt);
        startOfDay.setHours(0, 0, 0, 0); // Set to the start of the day

        const endOfDay = new Date(createdAt);
        endOfDay.setHours(23, 59, 59, 999); // Set to the end of the day

        whereClause.createdAt = Between(startOfDay.toISOString(), endOfDay.toISOString());
      }

      if (storeName) {
        whereClause.store = { name: ILike(`%${storeName}%`) };
      }

      // Pagination options
      const paginationOptions: FindManyOptions<Booking> = {
        relations: ["specialist", "service", "store", "timeSlot", "user"],
        select: {
          user: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        where: whereClause,
        skip: options?.skip || 0,
        take: options?.take || 10,
      };

      // Merge with user-provided options
      const finalOptions = { ...paginationOptions, ...options };

      return await this.bookingRepository.find(finalOptions);
    } catch (error) {
      Logger.error(`Error finding bookings: ${error.message}`);
      throw new Error(`Error finding bookings: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      return await this.bookingRepository.findOne({ where: { id } });
    } catch (error) {
      Logger.error(`Error finding booking with ID ${id}: ${error.message}`);
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    try {
      const updatedBooking = await this.bookingRepository.preload({
        id,
        ...updateBookingDto,
      });
      if (!updatedBooking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
      return await this.bookingRepository.save(updatedBooking);
    } catch (error) {
      Logger.error(`Error updating booking with ID ${id}: ${error.message}`);
      throw new Error(`Error updating booking with ID ${id}: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const bookingToRemove = await this.findOne(id);
      return await this.bookingRepository.remove(bookingToRemove);
    } catch (error) {
      Logger.error(`Error removing booking with ID ${id}: ${error.message}`);
      throw new Error(`Error removing booking with ID ${id}: ${error.message}`);
    }
  }
}
