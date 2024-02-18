import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus, Req, BadRequestException } from '@nestjs/common';
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
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) { }

  @Post('/login')
  async login(@Body() signInDto: SignInDto): Promise<{ token: string, refreshToken: string, User: Partial<User> }> {
    try {
      const login = await this.authService.signIn(signInDto);
      return login
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('/register')
  async signUp(@Body() signUpDto: SignUpDto): Promise<{ token: string, refreshToken: string, User: Partial<User> }> {
    try {

      const newUser = await this.authService.signUp(signUpDto);
      return newUser;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshToken(@GetUser() user: any): Promise<{ token: string, refreshToken: string }> {

    try {
      const newTokens = await this.authService.refreshToken(user);
      console.log(newTokens)
      return newTokens;
    } catch (error) {
      throw new HttpException('Unable to refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req: any): Promise<void> {
    await this.authService.logout(req.user['id']);
  }

}
