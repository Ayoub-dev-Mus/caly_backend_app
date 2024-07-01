import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, ILike, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { BookingStatus } from './enum/booking.status';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) { }

  async create(createBookingDto: CreateBookingDto, user: User) {
    try {
      createBookingDto.user = user;
      createBookingDto.status = BookingStatus.CONFIRMED
      Logger.log(createBookingDto);
      const newBooking = this.bookingRepository.create(createBookingDto);
      return await this.bookingRepository.save(newBooking);
    } catch (error) {
      // Log the error or handle it accordingly
      Logger.error(`Error creating booking: ${error.message}`);
      throw new Error(`Error creating booking: ${error.message}`);
    }
  }


  async getAllBookingSumByStore(user: User): Promise<{ total: number }> {
    try {
      const bookingSumQuery = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('COUNT(booking.id)', 'total')
        .where('booking.storeId = :storeId', { storeId: user.store })
        .getRawOne();

      return { total: parseInt(bookingSumQuery.total, 10) };
    } catch (error) {
      Logger.error(`Error getting total booking sum by store: ${error.message}`);
      throw new Error(`Error getting total booking sum by store: ${error.message}`);
    }
  }


  async findAllByStore(
    user: User,
    createdAt?: Date,
    status?: string, // Assuming status is a string, adjust type if necessary
    options?: FindManyOptions<Booking>,
  ): Promise<Booking[]> {
    try {
      const whereClause: any = {
        store: { id: user.store },
      };

      if (createdAt) {
        const startOfDay = new Date(createdAt);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(createdAt);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause.createdAt = Between(
          startOfDay.toISOString(),
          endOfDay.toISOString(),
        );

        Logger.log(`Filtering bookings between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
      }

      if (status) {
        whereClause.status = status; // Assuming 'status' is a field in your Booking entity
      }

      // Pagination options
      const paginationOptions: FindManyOptions<Booking> = {
        relations: ['specialist', 'service', 'store', 'timeSlot', 'user'],
        select: {
          user: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
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


  async getSalesSummary(
    user: User,
    period: 'daily' | 'weekly' | 'monthly',
  ): Promise<{ totalSales: number }> {
    try {

      console.log(user)
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          throw new Error('Invalid period specified');
      }

      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      const totalSalesQuery = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoin('booking.service', 'service')
        .select('SUM(service.price)', 'totalSales')
        .where('booking.store = :storeId', { storeId: user.store })
        .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getRawOne();

      let totalSales = parseFloat(totalSalesQuery.totalSales || '0');

      return { totalSales };
    } catch (error) {
      Logger.error(`Error getting sales summary: ${error.message}`);
      throw new Error(`Error getting sales summary: ${error.message}`);
    }
  }



  async findAll(
    user: User,
    createdAt?: Date,
    storeName?: string,
    options?: FindManyOptions<Booking>,
  ) {
    try {
      const whereClause: any = {
        user: { id: user.id },
      };

      if (createdAt) {
        const startOfDay = new Date(createdAt);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(createdAt);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause.createdAt = Between(
          startOfDay.toISOString(),
          endOfDay.toISOString(),
        );
      }

      if (storeName) {
        whereClause.store = { name: ILike(`%${storeName}%`) };
      }

      // Pagination options
      const paginationOptions: FindManyOptions<Booking> = {
        relations: ['specialist', 'service', 'store', 'timeSlot', 'user'],
        select: {
          user: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
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


  async findAllBookingByStore(
    user: User,
    createdAt?: Date,
    storeName?: string,
    options?: FindManyOptions<Booking>,
  ) {
    try {
      const whereClause: any = {
        store: { id: user.store },
      };

      if (createdAt) {
        const startOfDay = new Date(createdAt);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(createdAt);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause.createdAt = Between(
          startOfDay.toISOString(),
          endOfDay.toISOString(),
        );
      }

      if (storeName) {
        whereClause.store = { name: ILike(`%${storeName}%`) };
      }

      // Pagination options
      const paginationOptions: FindManyOptions<Booking> = {
        relations: ['specialist', 'service', 'store', 'timeSlot', 'user'],
        select: {
          user: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        where: whereClause,
      };

      return await this.bookingRepository.find(paginationOptions);
    } catch (error) {
      Logger.error(`Error finding bookings: ${error.message}`);
      throw new Error(`Error finding bookings: ${error.message}`);
    }
  }
  //data
  async findAllByStoreWithUser(user: User, options?: FindManyOptions<Booking>) {
    try {
      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.user', 'user')
        .where('booking.storeId = :storeId', { storeId: user.store })
        .getMany();

      return bookings;
    } catch (error) {
      Logger.error(
        `Error finding bookings by store with user: ${error.message}`,
      );
      throw new Error(
        `Error finding bookings by store with user: ${error.message}`,
      );
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
  async getCompletedBookingSumByStore(user: User): Promise<{ total: number }> {
    try {
      const bookingSumQuery = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('COUNT(booking.id)', 'total')
        .where('booking.storeId = :storeId', { storeId: user.store })
        .andWhere('booking.status = :status', { status: 'COMPLETED' })
        .getRawOne();

      return { total: parseInt(bookingSumQuery.total, 10) };
    } catch (error) {
      Logger.error(`Error getting completed booking sum by store: ${error.message}`);
      throw new Error(`Error getting completed booking sum by store: ${error.message}`);
    }
  }


  async getConfirmedBookingSumByStore(user: User): Promise<{ total: number }> {
    try {


      const bookingSumQuery = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('COUNT(booking.id)', 'total')
        .where('booking.storeId = :storeId', { storeId: user.store })
        .andWhere('booking.status = :status', { status: 'CONFIRMED' })
        .getRawOne();

      return { total: parseInt(bookingSumQuery.total, 10) };
    } catch (error) {
      Logger.error(`Error getting confirmed booking sum by store: ${error.message}`);
      throw new Error(`Error getting confirmed booking sum by store: ${error.message}`);
    }
  }


  async getPendingBookingSumByStore(user: User): Promise<{ total: number }> {
    try {
      const bookingSumQuery = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('COUNT(booking.id)', 'total')
        .where('booking.storeId = :storeId', { storeId: user.store })
        .andWhere('booking.status = :status', { status: 'PENDING' })
        .getRawOne();

      return { total: parseInt(bookingSumQuery.total, 10) };
    } catch (error) {
      Logger.error(`Error getting pending booking sum by store: ${error.message}`);
      throw new Error(`Error getting pending booking sum by store: ${error.message}`);
    }
  }

  //to master
  async getBookingSumByStore(
    user: User,
  ): Promise<{ storeId: string; bookingSum: number }[]> {
    try {
      const bookingSumQuery = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoin('booking.store', 'store')
        .select('store.id', 'storeId')
        .addSelect('COUNT(booking.id)', 'bookingSum')
        .where('booking.userId = :userId', { userId: user.id })
        .groupBy('store.id')
        .getRawMany();

      return bookingSumQuery;
    } catch (error) {
      Logger.error(`Error getting booking sum by store: ${error.message}`);
      throw new Error(`Error getting booking sum by store: ${error.message}`);
    }
  }
}
