import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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


      console.log(user.store)


      const whereClause: any = {
        store: user.store,
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

      if (status) {
        whereClause.status = status;
      }

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

      const finalOptions = { ...paginationOptions, ...options };

      return await this.bookingRepository.find(finalOptions);
    } catch (error) {
      Logger.error(`Error finding bookings: ${error.message}`);
      throw new Error(`Error finding bookings: ${error.message}`);
    }
  }

  async getKPIData(user: User, period: 'monthly' | 'weekly' | 'yearly'): Promise<{ period: string, paid: number, rejected: number }[]> {
    try {
      const kpiData = [];
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const periods: string[] = [];

      switch (period) {
        case 'monthly':
          for (let i = 0; i < 12; i++) {
            const startDate = new Date(currentYear, i, 1);
            const endDate = new Date(currentYear, i + 1, 0);

            const [paidCount, rejectedCount] = await Promise.all([
              this.bookingRepository.count({
                where: {
                  store: user.store,
                  status: BookingStatus.CONFIRMED,
                  createdAt: Between(startDate, endDate),
                }
              }),
              this.bookingRepository.count({
                where: {
                  store: user.store,
                  status: BookingStatus.REJECTED,
                  createdAt: Between(startDate, endDate),
                }
              })
            ]);

            periods.push(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]);
            kpiData.push({
              period: periods[i],
              paid: paidCount,
              rejected: rejectedCount
            });
          }
          break;

        case 'weekly':
          const startOfYear = new Date(currentYear, 0, 1);
          const endOfYear = new Date(currentYear + 1, 0, 1);
          const oneWeek = 7 * 24 * 60 * 60 * 1000; // milliseconds in a week

          for (let i = 0; startOfYear < endOfYear; i++) {
            const startDate = new Date(startOfYear.getTime() + i * oneWeek);
            const endDate = new Date(startDate.getTime() + oneWeek - 1);

            const [paidCount, rejectedCount] = await Promise.all([
              this.bookingRepository.count({
                where: {
                  store: user.store,
                  status: BookingStatus.CONFIRMED,
                  createdAt: Between(startDate, endDate),
                }
              }),
              this.bookingRepository.count({
                where: {
                  store: user.store,
                  status: BookingStatus.REJECTED,
                  createdAt: Between(startDate, endDate),
                }
              })
            ]);

            kpiData.push({
              period: `Week ${i + 1}`,
              paid: paidCount,
              rejected: rejectedCount
            });
          }
          break;

        case 'yearly':
          const startYear = currentYear - 5; // Last 5 years including current year
          for (let i = 0; i <= 5; i++) {
            const startDate = new Date(startYear + i, 0, 1);
            const endDate = new Date(startYear + i + 1, 0, 1);

            const [paidCount, rejectedCount] = await Promise.all([
              this.bookingRepository.count({
                where: {
                  store: user.store,
                  status: BookingStatus.CONFIRMED,
                  createdAt: Between(startDate, endDate),
                }
              }),
              this.bookingRepository.count({
                where: {
                  store: user.store,
                  status: BookingStatus.REJECTED,
                  createdAt: Between(startDate, endDate),
                }
              })
            ]);

            kpiData.push({
              period: (startYear + i).toString(),
              paid: paidCount,
              rejected: rejectedCount
            });
          }
          break;

        default:
          throw new BadRequestException('Invalid period specified');
      }

      return kpiData;
    } catch (error) {
      Logger.error(`Error getting KPI data: ${error.message}`);
      throw new Error(`Error getting KPI data: ${error.message}`);
    }
  }


  async getTotalSalesRevenue(user: User, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<{ totalRevenue: number }> {
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setDate(now.getDate() - now.getDay() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        default:
          throw new Error('Invalid period specified');
      }

      const totalRevenueQuery = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoin('booking.service', 'service')
        .select('SUM(service.price)', 'totalRevenue')
        .where('booking.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('booking.storeId = :storeId', { storeId: user.store })
        .getRawOne();

      let totalRevenue = parseFloat(totalRevenueQuery.totalRevenue || '0');

      return { totalRevenue };
    } catch (error) {
      Logger.error(`Error getting total sales revenue: ${error.message}`);
      throw new Error(`Error getting total sales revenue: ${error.message}`);
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
        .where('booking.createdAt BETWEEN :startDate AND :endDate', {
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

  async getSalesSummaryByLoggedUser(
    user: User,
    period: 'daily' | 'weekly' | 'monthly',
  ): Promise<{ totalSales: number }> {
    try {
      console.log(user);
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
        .where('booking.user = :user', { user: user }) // Filter by user ID
        .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getRawOne();

      let totalSales = parseFloat(totalSalesQuery.totalSales || '0');

      return { totalSales };
    } catch (error) {
      Logger.error(`Error getting sales summary for user ${user.id}: ${error.message}`);
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

  async getBookingSumByStore(
    user: User,
  ): Promise<{ storeId: string; bookingSum: number }[]> {
    try {
      const bookingSumQuery = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoin('booking.store', 'store')
        .addSelect('COUNT(booking.id)', 'bookingSum')
        .groupBy('store.id')
        .getRawMany();

      return bookingSumQuery;
    } catch (error) {
      Logger.error(`Error getting booking sum by store: ${error.message}`);
      throw new Error(`Error getting booking sum by store: ${error.message}`);
    }
  }
}
