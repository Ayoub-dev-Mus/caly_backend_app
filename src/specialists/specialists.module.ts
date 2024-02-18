import { Module } from '@nestjs/common';
import { SpecialistsService } from './specialists.service';
import { SpecialistsController } from './specialists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialist } from './entities/specialist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Specialist])],
  controllers: [SpecialistsController],
  providers: [SpecialistsService],
})
export class SpecialistsModule { }
