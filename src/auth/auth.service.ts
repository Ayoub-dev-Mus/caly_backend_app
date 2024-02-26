import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async signUp(createUserDto: SignUpDto): Promise<{ token: string, refreshToken: string, User: Partial<User> }> {
    try {
      createUserDto.email = createUserDto.email.toLowerCase();
      Logger.log(createUserDto);
      const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
      Logger.warn(existingUser);
      const hash = await this.hashData(createUserDto.password);

      const newUser = await this.usersService.create({
        ...createUserDto,
        password: hash,
        role: Role.USER,
      });

      if (!newUser) {
        throw new Error('User creation failed.');
      }

      const tokens = await this.getTokens(
        newUser.id,
        newUser.email,
        newUser.role,
        newUser.firstName,
        newUser.lastName,
        newUser.state,
        newUser.address,
        newUser.zipCode
      );

      // Prepare response object
      const response = {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        User: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          zipCode: newUser.zipCode,
          state: newUser.state,
          address: newUser.address,
          role: newUser.role,
        },
      };

      // Update refresh token
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);

      return response;
    } catch (error) {
      console.error('Error during sign-up:', error);
      throw error;
    }
  }

  async signIn(data: SignInDto) {
    try {
      const EXPIRE_TIME = 15 * 60 * 1000;
      const emailLowerCase = data.email.toLowerCase();
      const user = await this.usersService.findOneByEmail(emailLowerCase);

      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const passwordMatches = await bcrypt.compare(data.password, user.password);

      if (!passwordMatches) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const tokens = await this.getTokens(user.id, user.email, user.role, user.firstName, user.lastName, user.state, user.zipCode);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      const response = {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
        User: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          zipCode: user.zipCode,
          address: user.address,
          state: user.state,
          role: user.role,
        }
      };

      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async logout(id: string) {
    return this.usersService.update(id, { refreshToken: null });
  }

  private async hashData(data: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(data, saltRounds);
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    await this.usersService.update(id, {
      refreshToken: refreshToken,
    });
  }

  async getTokens(id: string, email: string, role: string, firstName: string, lastName: string, zipCode: string, state: string, address: string = null) {
    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: id,
          email,
          firstName,
          lastName,
          zipCode,
          state,
          address,
          role
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          id: id,
          email,
          firstName,
          lastName,
          zipCode,
          address,
          state,
          role
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      token,
      refreshToken,
    };
  }

  async refreshToken(user: User): Promise<{ token: string, refreshToken: string, expiresIn: number, User: Partial<User> }> {
    const EXPIRE_TIME = 15 * 60 * 1000;

    const tokens = await this.getTokens(user.id, user.email, user.role, user.firstName, user.lastName, user.state, user.zipCode);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const myuser = await this.usersService.findOneById(user.id);

    const response = {
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      expiresIn: new Date().getTime() + EXPIRE_TIME,
      User: {
        id: myuser.id,
        email: myuser.email,
        firstName: myuser.firstName,
        lastName: myuser.lastName,
        zipCode: myuser.zipCode,
        state: myuser.state,
        role: myuser.role,
      }
    }

    return response;
  }
}
