import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/role.guard';
import { JwtModule } from '@nestjs/jwt';
import { StoresModule } from './stores/stores.module';
import { Store } from './stores/entities/store.entity';
import 'reflect-metadata';
import { ReviewsModule } from './reviews/reviews.module';
import { ServicesModule } from './services/services.module';
import { SpecialistsModule } from './specialists/specialists.module';
import { BookingsModule } from './bookings/bookings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Specialist } from './specialists/entities/specialist.entity';
import { Service } from './services/entities/service.entity';
import { StoreType } from './stores/entities/storeType';
import { AppointmentsModule } from './appointments/appointments.module';
import { Appointment } from './appointments/entities/appointment.entity';
import { TimeSlot } from './appointments/entities/timeslots.entity';
import { Booking } from './bookings/entities/booking.entity';
import { OffersModule } from './offers/offers.module';
import { Offer } from './offers/entities/offer.entity';
import { Review } from './reviews/entities/review.entity';
import { DevicesTokensModule } from './devices-tokens/devices-tokens.module';
import { DeviceToken } from './devices-tokens/entities/devices-token.entity';
import { Notification } from './notifications/entities/notification.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from './redis/redis.module';
import { SocketModule } from './socket/socket.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsModule } from './chats/chats.module';

@Module({
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [],
  imports: [
    MongooseModule.forRoot('mongodb+srv://ayoubwahid282000:l9ZzxSpsliJu4KTD@cluster0.sj7f7ip.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),
    SocketModule,
    ScheduleModule.forRoot(),
    {
      ...JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '2d' },
      }),
      global: true,
    },
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [
        User,
        StoreType,
        Store,
        Specialist,
        Service,
        Appointment,
        TimeSlot,
        Booking,
        Offer,
        Review,
        DeviceToken,
        Notification,
      ],

      synchronize: true,
      migrations: [],
      subscribers: [],
    }),
    UsersModule,
    AuthModule,
    StoresModule,
    ReviewsModule,
    ServicesModule,
    SpecialistsModule,
    BookingsModule,
    NotificationsModule,
    AppointmentsModule,
    OffersModule,
    DevicesTokensModule,
    DevicesTokensModule,
    RedisModule,
    SocketModule,
    ChatsModule,

  ],

  controllers: [AppController],
})
export class AppModule {}
