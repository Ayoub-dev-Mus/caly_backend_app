import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { zip } from 'rxjs';
import { UpdatePasswordDto } from './dto/update-password-dto';

@Injectable()
export class UsersService {


  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService
  ) { }


  async create(userData: CreateUserDto): Promise<User | null> {
    try {
      const user = this.userRepository.save(userData);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async findAll(
    page?: number,
    pageSize?: number,
    filter?: string,
  ): Promise<User[]> {
    try {
      let queryBuilder = this.userRepository.createQueryBuilder('user');
      if (filter) {
        queryBuilder = this.applyFilter(queryBuilder, filter);
      }
      const users = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();
      return users;
    } catch (error) {
      return error.message;
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email: email } });
      Logger.log(user)
      return user
    } catch (error) {
      return error.message
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneByOrFail({ id });
      return user
    } catch (error) {
      return error.message
    }
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<UpdateResult> {
    try {
      const updatedUser = await this.userRepository.update(id, updateUserDto);
      return updatedUser
    } catch (error) {
      return error.message
    }
  }

  async remove(id: string) {
    try {
      const deletedUser = await this.userRepository.delete(id);
      return deletedUser
    } catch (error) {
      return error.message
    }
  }

  async updateUserInfo(user: User, updateData: Partial<User>): Promise<any> {
    try {
      const updatedUserData = { ...updateData };
      delete updatedUserData.id;

      const EXPIRE_TIME = 15 * 60 * 1000;

      if (updatedUserData.password) {
        const saltRounds = 10;
        updatedUserData.password = await bcrypt.hash(updatedUserData.password, saltRounds);
      }






      const updateResult = await this.userRepository.update(user.id, updatedUserData);

      const myuser = await this.userRepository.findOne({ where: { id: user.id } });

      if (updateResult.affected > 0) {
        const token = this.jwtService.sign({
          id: myuser.id,
          email: myuser.email,
          firstName: myuser.firstName,
          lastName: myuser.lastName,
          role: myuser.role,
          zipCode: myuser.zipCode,
          state: myuser.state,
          address: myuser.address,
          phoneNumber: myuser.phoneNumber,
          profilePicture: myuser.profilePicture

        }, { expiresIn: '15m', secret: process.env.JWT_SECRET });

        const refreshToken = this.jwtService.sign({
          id: myuser.id,
          email: myuser.email,
          firstName: myuser.firstName,
          lastName: myuser.lastName,
          role: myuser.role,
          zipCode: myuser.zipCode,
          state: myuser.state,
          address: myuser.address,
          phoneNumber: myuser.phoneNumber,
          profilePicture: myuser.profilePicture

        }, { expiresIn: '7d', secret: process.env.JWT_SECRET });



        const response = {
          token: token,
          refreshToken: refreshToken,
          expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
          User: {
            id: myuser.id,
            email: myuser.email,
            firstName: myuser.firstName,
            lastName: myuser.lastName,
            zipCode: myuser.zipCode,
            state: myuser.state,
            address: myuser.address,
            phoneNumber: myuser.phoneNumber,
            profilePicture: myuser.profilePicture,
            role: myuser.role,
          }
        }



        return response;

      }

      return { updateResult };
    } catch (error) {
      return error.message
    }
  }

  async updatePassword(myuser: User, updatePasswordDto: UpdatePasswordDto): Promise<any> {
    try {
      const user = await this.userRepository.findOneBy({ id: myuser.id });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await bcrypt.compare(updatePasswordDto.oldPassword, user.password);
      Logger.log(isPasswordValid);
      if (!isPasswordValid) {
        throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
      const updated = await this.userRepository.update(user.id, { password: hashedPassword });
      return updated;
    } catch (error) {
      Logger.error('Error updating password', error.stack, 'UserService');

      throw error;
    }
  }

  private applyFilter(
    queryBuilder: SelectQueryBuilder<User>,
    filter: string,
  ): SelectQueryBuilder<User> {
    return queryBuilder
      .where('user.firstName LIKE :filter', { filter: `%${filter}%` })
      .orWhere('user.lastName LIKE :filter', { filter: `%${filter}%` })
      .orWhere('user.email LIKE :filter', { filter: `%${filter}%` })
      .orWhere('user.address LIKE :filter', { filter: `%${filter}%` })
      .orWhere('user.zipCode LIKE :filter', { filter: `%${filter}%` })
      .orWhere('user.state LIKE :filter', { filter: `%${filter}%` });
  }
}
