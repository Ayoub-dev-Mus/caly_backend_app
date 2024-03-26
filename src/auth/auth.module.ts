import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategy/accessToken.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenStrategy } from './strategy/refreshToken.strategy';
import { User } from 'src/users/entities/user.entity';
import { GoogleStrategy } from './strategy/google.strategy';
import { GoogleTokenVerifier } from './strategy/googleTokenVerifier';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    JwtService,
    GoogleStrategy,
    GoogleTokenVerifier,
  ],
  controllers: [AuthController],
  exports: [AuthModule],
})
export class AuthModule {}
