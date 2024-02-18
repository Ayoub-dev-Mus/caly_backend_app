import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { Specialist } from './entities/specialist.entity';
import CreateSpecialistDto from './dto/create-specialist.dto';

@Injectable()
export class SpecialistsService {
  constructor(
    @InjectRepository(Specialist)
    private specialistRepository: Repository<Specialist>,
  ) { }

  async create(createSpecialistDto: CreateSpecialistDto): Promise<Specialist> {
    const newSpecialist = this.specialistRepository.create(createSpecialistDto);
    return await this.specialistRepository.save(newSpecialist);
  }

  async findAll(): Promise<Specialist[]> {
    return await this.specialistRepository.find();
  }

  async findOne(id: number): Promise<Specialist> {
    const specialist = await this.specialistRepository.findOne({ where: { id } });
    if (!specialist) {
      throw new NotFoundException(`Specialist with ID ${id} not found`);
    }
    return specialist;
  }

  async findSpecialistsByStoreId(storeId: number): Promise<Specialist[]> {
    return await this.specialistRepository.find({where: { store: { id: storeId } }});
  }

  async findSpecialistsByServiceId(serviceId: number): Promise<Specialist[]> {
    return await this.specialistRepository.find({ where: { services: { id: serviceId } } });
  }

  async update(id: number, updateSpecialistDto: UpdateSpecialistDto): Promise<Specialist> {
    const existingSpecialist = await this.findOne(id);
    this.specialistRepository.merge(existingSpecialist, updateSpecialistDto);
    return await this.specialistRepository.save(existingSpecialist);
  }

  async remove(id: number): Promise<void> {
    const existingSpecialist = await this.findOne(id);
    await this.specialistRepository.remove(existingSpecialist);
  }
}
