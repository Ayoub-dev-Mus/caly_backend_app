import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/jwtMiddlware';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasRoles } from 'src/common/role.decorator';
import { Role } from './enums/role';
import { User } from './entities/user.entity';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UpdateResult } from 'typeorm';
import { UpdatePasswordDto } from './dto/update-password-dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }


  @Get()
  async findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number, @Query('filter') filter?: string) {
    try {
      const users = await this.usersService.findAll(page, pageSize, filter);
      return users
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOneById(id);
      return user
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':email')
  async findOneByEmail(@Param('email') email: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      return user
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Patch('/me')
  async updateUser(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.updateUserInfo(user, updateUserDto);
      return updatedUser
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Post("/me/update-password")
  async updatePassword(@Body() updateUserDto: UpdatePasswordDto, @GetUser() loggedUser: User): Promise<UpdateResult> {
    try {
      const user = await this.usersService.updatePassword(loggedUser, updateUserDto);
      return user
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return user
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }



  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const user = await this.usersService.remove(id);
      return user
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
