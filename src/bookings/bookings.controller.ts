import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiTags } from '@nestjs/swagger';
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: User) {
    return this.bookingsService.create(createBookingDto, user);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Get()
  async findAll(
    @GetUser() user: User,
    @Query('createdAt') createdAtString: string, // Receive createdAt as string
    @Query('storeName') storeName: string,
    @Query() query: any,
  ): Promise<Booking[]> {
    const { skip, take } = query; // Destructure skip and take from query

    const options: FindManyOptions<Booking> = {};

    // Convert skip and take to numbers if provided
    if (skip !== undefined) {
      options.skip = parseInt(skip, 10);
    }
    if (take !== undefined) {
      options.take = parseInt(take, 10);
    }

    // This part remains unchanged
    let createdAt: Date | undefined;
    if (createdAtString) {
      createdAt = new Date(createdAtString); // Parse the string to a Date object
    }

    return this.bookingsService.findAll(user, createdAt, storeName, options);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(+id);
  }
}
