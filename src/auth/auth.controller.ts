import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';

import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { GetUser } from 'src/common/jwtMiddlware';
import { ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signUp.dto';
import { UsersService } from 'src/users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('google')
  async authenticateWithGoogle(@Body('token') token: string): Promise<any> {
    try {
      const user = await this.authService.googleLogin(token);
      return user;
    } catch (error) {
      throw new HttpException(
        'Failed to authenticate with Google ' + error.message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('/login')
  async login(
    @Body() signInDto: SignInDto,
  ): Promise<{ token: string; refreshToken: string; User: Partial<User> }> {
    try {
      const login = await this.authService.signIn(signInDto);
      return login;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<void> {
    await this.authService.forgotPassword(email).catch((error) => {
      Logger.error('Error during forgot password process', error);
      throw new BadRequestException(error.message);
    });
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ): Promise<{ verified: boolean }> {
    try {
      const verified = await this.authService.verifyOtp(email, otp);
      return { verified };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    try {
      await this.authService.resetPassword(email, otp, newPassword);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Post('/register')
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<{ token: string; refreshToken: string; User: Partial<User> }> {
    try {
      const newUser = await this.authService.signUp(signUpDto);
      return newUser;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshToken(
    @GetUser() user: any,
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      const newTokens = await this.authService.refreshToken(user);
      console.log(newTokens);
      return newTokens;
    } catch (error) {
      throw new HttpException(
        'Unable to refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req: any): Promise<void> {
    await this.authService.logout(req.user['id']);
  }
}
