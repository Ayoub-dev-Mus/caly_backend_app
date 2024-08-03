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
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';

import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { GetUser } from 'src/common/jwtMiddlware';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signUp.dto';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/users/enums/role';
import { HasRoles } from 'src/common/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';


class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address associated with the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'One-time password to verify',
    example: '123456',
  })
  otp: string;
}

class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address associated with the user account',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'One-time password for authentication',
    example: '123456',
  })
  otp: string;

  @ApiProperty({
    description: 'New password to be set for the user account',
    example: 'newStrongPassword123!',
  })
  newPassword: string;
}

class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address associated with the user account',
    example: 'user@example.com',
  })
  email: string;
}
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
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 204, description: 'Password reset link sent if email is registered' })
  @ApiResponse({ status: 400, description: 'Bad Request if the email is not processed' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    await this.authService.forgotPassword(forgotPasswordDto.email).catch((error) => {
      Logger.error('Error during forgot password process', error);
      throw new BadRequestException(error.message);
    });
  }

  @Post('create-user-with-role')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STAFF)
  async createUserWithRole(
    @Body() createUserDto: SignUpDto,
    @Body('role') role: Role,
  ): Promise<any> {
    if (![Role.USER, Role.STORE_OWNER, Role.STORE_STAFF, Role.ADMIN, Role.STAFF].includes(role)) {
      throw new ForbiddenException('Invalid role specified.');
    }
    try {
      const response = await this.authService.createUserWithRole(createUserDto, role);
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify one-time password (OTP)' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verification result', type: Boolean })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto
  ): Promise<{ verified: boolean }> {
    try {
      const verified = await this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
      return { verified };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  @Post('reset-password')
  @ApiOperation({ summary: 'Reset the user password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 204, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Bad Request if the inputs are invalid or operation fails' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    try {
      await this.authService.resetPassword(resetPasswordDto.email, resetPasswordDto.otp, resetPasswordDto.newPassword);
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
    @GetUser() user: User,
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
