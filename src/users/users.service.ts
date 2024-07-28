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
import { Store } from 'src/stores/entities/store.entity';
import serviceAccount from '../../src/config/mykey.json';

@Injectable()
export class UsersService {



  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    },'user');
  }



  async countUsersByRole(role: string): Promise<number> {
    try {
      const count = await this.userRepository.count({ where: { role } });
      return count;
    } catch (error) {
      Logger.error('Error counting users by role:', error);
      throw new HttpException('Error counting users by role', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
  async findUsersByIds(userIds: string[]): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();
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
        users = await queryBuilder.getMany();
      }

      return { users, totalUser };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], totalUser: 0 };
    }
  }
  async findUsersByStoreId(user: User): Promise<User[]> {
    try {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.store', 'store')
        .where('store.id = :storeId', { storeId: user.store })
        .getMany();

      if (users.length === 0) {
        throw new HttpException('No users found with the specified storeId', HttpStatus.NOT_FOUND);
      }

      return users;
    } catch (error) {
      Logger.error(`Error finding users by storeId: ${error.message}`);
      throw new HttpException('Error finding users by storeId', HttpStatus.BAD_REQUEST);
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
  async linkUserToStore(userId: string, storeId: Store): Promise<User> {
    try {
      const user = await this.userRepository.findOneByOrFail({ id: userId });
      user.store = storeId;
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      Logger.error(`Error linking user to store: ${error.message}`);
      throw new HttpException('Error linking user to store', HttpStatus.BAD_REQUEST);
    }
  }

  async getUserEngagement(period: 'daily' | 'weekly' | 'monthly'): Promise<number> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        throw new HttpException('Invalid period specified', HttpStatus.BAD_REQUEST);
    }

    try {
      const count = await this.userRepository.createQueryBuilder('user')
        .where('user.lastLogin >= :startDate', { startDate })
        .getCount();

      return count;
    } catch (error) {
      Logger.error(`Error fetching user engagement for ${period}:`, error);
      throw new HttpException(`Error fetching user engagement for ${period}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async countUsersByClientRole(): Promise<number> {
    try {
      const count = await this.userRepository.count({ where: { role: Role.USER } });
      return count;
    } catch (error) {
      Logger.error('Error counting users with role CLIENT:', error);
      throw new HttpException('Error counting users with role CLIENT', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserInFirebase(id: string, updateUserDto: Partial<User>): Promise<void> {
    try {
      const userRef =  admin.firestore().collection('users').doc(id);
      await userRef.update(updateUserDto);
      Logger.log(`Firestore user document updated with ID: ${id}`);
    } catch (error) {
      Logger.error(`Failed to update Firestore user document: ${error.message}`);
      throw new Error(`Failed to update Firestore user document: ${error.message}`);
    }
  }
  async getUserEngagementKPI(period: 'daily' | 'weekly' | 'monthly'): Promise<any> {
    try {
      const engagementCount = await this.getUserEngagement(period);
      const totalUsers = await this.userRepository.count();

      const kpi = (engagementCount / totalUsers) * 100;

      return {
        period,
        engagementCount,
        totalUsers,
        kpi: kpi.toFixed(2) + '%',
      };
    } catch (error) {
      Logger.error('Error calculating user engagement KPI:', error);
      throw new HttpException('Error calculating user engagement KPI', HttpStatus.INTERNAL_SERVER_ERROR);
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
