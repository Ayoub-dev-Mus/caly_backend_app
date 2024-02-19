import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/role.guard';
import { JwtModule } from '@nestjs/jwt';
import { StoresModule } from './stores/stores.module';
import { Store } from './stores/entities/store.entity';
import "reflect-metadata";
import { ReviewsModule } from './reviews/reviews.module';
import { ServicesModule } from './services/services.module';
import { SpecialistsModule } from './specialists/specialists.module';
import { BookingsModule } from './bookings/bookings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CalendarsModule } from './calendars/calendars.module';
import { Specialist } from './specialists/entities/specialist.entity';
import { Service } from './services/entities/service.entity';
import { StoreType } from './stores/entities/storeType';
import { AppointmentsModule } from './appointments/appointments.module';
import { Appointment } from './appointments/entities/appointment.entity';
import { TimeSlot } from './appointments/entities/timeslots.entity';

@Module({
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  //Comment
  imports: [
    {
      ...JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
      }), global: true
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
        rejectUnauthorized: false
      },

      entities: [User, StoreType, Store, Specialist, Service, Appointment, TimeSlot],
      synchronize: true,
      migrations: [],
      subscribers: [],
    }), UsersModule, AuthModule, StoresModule, ReviewsModule, ServicesModule, SpecialistsModule, BookingsModule, NotificationsModule, CalendarsModule, AppointmentsModule],
  controllers: [AppController],

})
export class AppModule { }
