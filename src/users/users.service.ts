import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UpdatePasswordDto } from './dto/update-password-dto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Multer } from 'multer';
import * as admin from 'firebase-admin';
import { Role } from './enums/role';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async uploadProfileImage(file: Multer.File): Promise<any> {
    try {
      const s3 = new S3Client({
        region: 'eu-north-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS,
          secretAccessKey: process.env.AWS_SECRET,
        },
      });
      const key = `${Date.now()}-${file.originalname}`;
      const uploadParams = {
        Bucket: 'caly-app-bucker',
        Key: key,
        Body: file.buffer,
      };

      const result = await s3.send(new PutObjectCommand(uploadParams));

      if (!result) {
        throw new Error('Error uploading file to S3');
      }
      return key;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateProfileImage(user: User, file: Multer.File): Promise<string> {
    try {
      const key = await this.uploadProfileImage(file);
      Logger.log(key);
      user.profilePicture = `${process.env.AWS_S3_BASE_URL}/${key}`; // Use the key
      Logger.log(user.profilePicture);
      await this.userRepository.update(user.id, {
        profilePicture: user.profilePicture,
      });

      return user.profilePicture;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

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
    role?: string,
  ): Promise<{ users: User[]; totalUser: number }> {
    try {
      let queryBuilder = this.userRepository.createQueryBuilder('user');

      if (filter) {
        queryBuilder = this.applyFilter(queryBuilder, filter);
      }

      if (role) {
        queryBuilder = queryBuilder.andWhere('user.role = :role', { role });
      }

      let totalUser = await queryBuilder.getCount();

      let users: User[];
      if (page !== undefined && pageSize !== undefined) {
        users = await queryBuilder
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .getMany();
      } else {
        // If page and pageSize are not provided, fetch all users
        users = await queryBuilder.getMany();
      }

      return { users, totalUser };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], totalUser: 0 };
    }
  }


  async createStaff(createUserDto: CreateUserDto): Promise<User | null> {
    try {
      createUserDto.role = Role.STAFF
      const user = await this.create(createUserDto);
      return user;
    } catch (error) {
      console.error('Error creating staff:', error);
      return null;
    }
  }

  async createStoreOwner(createUserDto: CreateUserDto): Promise<User | null> {
    try {
      createUserDto.role = Role.STORE_OWNER
      const user = await this.create(createUserDto);
      return user;
    } catch (error) {
      console.error('Error creating store owner:', error);
      return null;
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
        relations: ['store'],
      });
      Logger.log(user);
      return user;
    } catch (error) {
      return error.message;
    }
  }

  async findOneByEmailJoinedWithStore(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
        relations: ['store'],
      });
      Logger.log(user);
      return user;
    } catch (error) {
      return error.message;
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneByOrFail({ id });
      return user;
    } catch (error) {
      return error.message;
    }
  }

  async update(
    id: string,
    updateUserDto: Partial<User>,
  ): Promise<UpdateResult> {
    try {
      const updatedUser = await this.userRepository.update(id, updateUserDto);
      return updatedUser;
    } catch (error) {
      return error.message;
    }
  }

  async remove(id: string) {
    try {
      const deletedUser = await this.userRepository.delete(id);
      return deletedUser;
    } catch (error) {
      return error.message;
    }
  }

  async updateUserInfo(user: User, updateData: Partial<User>): Promise<any> {
    try {
      const updatedUserData = { ...updateData };
      delete updatedUserData.id;

      const EXPIRE_TIME = 15 * 60 * 1000;

      if (updatedUserData.password) {
        const saltRounds = 10;
        updatedUserData.password = await bcrypt.hash(
          updatedUserData.password,
          saltRounds,
        );
      }

      const updateResult = await this.userRepository.update(
        user.id,
        updatedUserData,
      );

      const myuser = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (updateResult.affected > 0) {
        const token = this.jwtService.sign(
          {
            id: myuser.id,
            email: myuser.email,
            firstName: myuser.firstName,
            lastName: myuser.lastName,
            role: myuser.role,
            zipCode: myuser.zipCode,
            state: myuser.state,
            address: myuser.address,
            phoneNumber: myuser.phoneNumber,
            profilePicture: myuser.profilePicture,
          },
          { expiresIn: '15m', secret: process.env.JWT_SECRET },
        );

        const refreshToken = this.jwtService.sign(
          {
            id: myuser.id,
            email: myuser.email,
            firstName: myuser.firstName,
            lastName: myuser.lastName,
            role: myuser.role,
            zipCode: myuser.zipCode,
            state: myuser.state,
            address: myuser.address,
            phoneNumber: myuser.phoneNumber,
            profilePicture: myuser.profilePicture,
          },
          { expiresIn: '7d', secret: process.env.JWT_SECRET },
        );

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
          },
        };

        return response;
      }

      return { updateResult };
    } catch (error) {
      return error.message;
    }
  }

  async updatePassword(
    myuser: User,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<any> {
    try {
      const user = await this.userRepository.findOneBy({ id: myuser.id });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await bcrypt.compare(
        updatePasswordDto.oldPassword,
        user.password,
      );
      Logger.log(isPasswordValid);
      if (!isPasswordValid) {
        throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(
        updatePasswordDto.newPassword,
        10,
      );
      const updated = await this.userRepository.update(user.id, {
        password: hashedPassword,
      });
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
