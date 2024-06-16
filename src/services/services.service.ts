import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import CreateServiceDto from './dto/create-service.dto';
import { Service } from './entities/service.entity';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) { }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      const newService = this.serviceRepository.create(createServiceDto);
      return await this.serviceRepository.save(newService);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      return await this.serviceRepository.find();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOne(id: number): Promise<Service> {
    try {
      const service = await this.serviceRepository.findOne({ where: { id } });
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
      return service;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async findByStoreId(storeId: number): Promise<Service[]> {
    try {
      const services = await this.serviceRepository.find({ where: { store: { id: storeId } } });
      if (services.length === 0) {
        throw new NotFoundException(`No services found for store with ID ${storeId}`);
      }
      return services;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<UpdateResult> {
    try {
      return await this.serviceRepository.update(id, updateServiceDto);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.serviceRepository.delete(id);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
