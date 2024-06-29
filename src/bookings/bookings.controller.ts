import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../common/jwtMiddlware';
import { User } from 'src/users/entities/user.entity';
import { FindManyOptions } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { HasRoles } from 'src/common/role.decorator';
import { Role } from 'src/users/enums/role';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: User) {
    return this.bookingsService.create(createBookingDto, user);
  }


  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER, Role.STORE_STAFF, Role.STORE_OWNER)
  @Get("store/logged")
  async findAllByStore(
    @GetUser() user: User,
    @Query('createdAt') createdAtString: string,
    @Query('skip') skip = '0',
    @Query('take') take = '10',
  ): Promise<Booking[]> {
    try {
      const date = createdAtString ? new Date(createdAtString) : undefined;
      const options = {
        skip: parseInt(skip, 10),
        take: parseInt(take, 10),
      };

      let createdAt: Date | undefined;
      if (createdAtString) {
        createdAt = new Date(createdAtString);
      }

      return await this.bookingsService.findAllByStore(user, date, options);
    } catch (error) {
      throw new HttpException(`Error finding bookings: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Get()
  async findAll(
    @GetUser() user: User,
    @Query('createdAt') createdAtString: string,
    @Query('storeName') storeName: string,
    @Query() query: any,
  ): Promise<Booking[]> {
    const { skip, take } = query;

    const options: FindManyOptions<Booking> = {};

    if (skip !== undefined) {
      options.skip = parseInt(skip, 10);
    }
    if (take !== undefined) {
      options.take = parseInt(take, 10);
    }

    let createdAt: Date | undefined;
    if (createdAtString) {
      createdAt = new Date(createdAtString);
    }

    return this.bookingsService.findAll(user, createdAt, storeName, options);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF)
  @Get('completed-sum')
  getCompletedBookingSumByStore(
    @GetUser() user: User,
  ): Promise<{ total: number }> {
    return this.bookingsService.getCompletedBookingSumByStore(user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF)
  @Get('store')
  getAllBookingsByStore(@GetUser() user: User): Promise<Booking[]> {
    return this.bookingsService.findAllBookingByStore(user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF)
  @Get('all-sum')
  getAllBookingSumByStore(
    @GetUser() user: User,
  ): Promise<{ total: number }> {
    return this.bookingsService.getAllBookingSumByStore(user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF)
  @Get('sales-summary')
  async getSalesSummary(
    @GetUser() user:User,
    @Query('period') period: 'daily' | 'weekly' | 'monthly',
  ): Promise<{ totalSales: number }> {
    console.log(user)
    return await this.bookingsService.getSalesSummary(user, period);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF)
  @Get('pending-sum')
  getPendingBookingSumByStore(
    @GetUser() user: User,
  ): Promise<{ total: number }> {
    return this.bookingsService.getPendingBookingSumByStore(user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF)
  @Get('confirmed-sum')
  getConfirmedBookingSumByStore(
    @GetUser() user: User,
  ): Promise<{ total: number }> {
    return this.bookingsService.getConfirmedBookingSumByStore(user);
  }


  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF)
  @Get('by-store')
  findAllByStoreWithUser(@GetUser() user: User): Promise<Booking[]> {
    return this.bookingsService.findAllByStoreWithUser(user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(+id, updateBookingDto);
  }



  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(+id);
  }
}
