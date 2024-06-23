import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Post,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/jwtMiddlware';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { HasRoles } from 'src/common/role.decorator';
import { Role } from './enums/role';
import { User } from './entities/user.entity';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UpdateResult } from 'typeorm';
import { UpdatePasswordDto } from './dto/update-password-dto';
import { CreateUserDto } from './dto/create-user.dto';
import { EOL } from 'os';
import { Store } from 'src/stores/entities/store.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('filter') filter?: string,
    @Query('role') role?: string,
  ) {
    try {
      const users = await this.usersService.findAll(page, pageSize, filter, role);
      return users;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Patch(':userId/link-store')
  async linkUserToStore(
    @Param('userId') userId: string,
    @Body('storeId') storeId: Store
  ): Promise<User> {
    try {
      const user = await this.usersService.linkUserToStore(userId, storeId);
      return user;
    } catch (error) {
      Logger.error(`Error linking user to store: ${error.message}`);
      throw new HttpException('Error linking user to store', HttpStatus.BAD_REQUEST);
    }
  }
  //to master
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER, Role.STORE_STAFF)
  @UseGuards(JwtAuthGuard)
  @Get('by-store')
  async findUsersByStore(@GetUser() user: User): Promise<any> {
    try {

      if (!user) {
        throw new HttpException('Store ID not found in token', HttpStatus.BAD_REQUEST);
      }
      const users = await this.usersService.findUsersByStoreId(user);
      return users;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOneById(id);
      return user;
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }



  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Patch('upload-profile-image')
  @UseInterceptors(FileInterceptor('profile'))
  async uploadImage(
    @UploadedFile() file: Multer.File,
    @GetUser() user: User,
  ): Promise<string> {
    try {
      const uploadedImage = await this.usersService.updateProfileImage(
        user,
        file,
      );

      return uploadedImage;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('create-staff')
  async createStaff(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.createStaff(createUserDto);
      if (!user) {
        throw new HttpException('Error creating staff', HttpStatus.BAD_REQUEST);
      }
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('create-store-owner')
  async createStoreOwner(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.createStoreOwner(createUserDto);
      if (!user) {
        throw new HttpException('Error creating store owner', HttpStatus.BAD_REQUEST);
      }
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':email')
  async findOneByEmail(@Param('email') email: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      return user;
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Patch('/me')
  async updateUser(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.usersService.updateUserInfo(
        user,
        updateUserDto,
      );
      return updatedUser;
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //fixed password
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Patch('/me/update-password')
  async updatePassword(
    @Body() updateUserDto: UpdatePasswordDto,
    @GetUser() loggedUser: User,
  ): Promise<UpdateResult> {
    try {
      const user = await this.usersService.updatePassword(
        loggedUser,
        updateUserDto,
      );
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return user;
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const user = await this.usersService.remove(id);
      return user;
    } catch (error) {
      new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
