import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {


  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
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
