import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { Specialist } from './entities/specialist.entity';
import CreateSpecialistDto from './dto/create-specialist.dto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Multer } from 'multer';

@Injectable()
export class SpecialistsService {
  constructor(
    @InjectRepository(Specialist)
    private specialistRepository: Repository<Specialist>,
  ) {}

  async create(createSpecialistDto: CreateSpecialistDto, profileImageFile?: Multer.File): Promise<Specialist> {
    try {
      const { profilePicture, ...rest } = createSpecialistDto;
      const newSpecialist = this.specialistRepository.create(rest);

      if (profileImageFile) {
        newSpecialist.profilePicture = await this.uploadProfileImage(profileImageFile);
      }

      return await this.specialistRepository.save(newSpecialist);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create specialist: ' + error.message);
    }
  }

  async findAll(): Promise<Specialist[]> {
    try {
      return await this.specialistRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve specialists: ' + error.message);
    }
  }

  async findOne(id: number): Promise<Specialist> {
    try {
      const specialist = await this.specialistRepository.findOne({
        where: { id },
      });
      if (!specialist) {
        throw new NotFoundException(`Specialist with ID ${id} not found`);
      }
      return specialist;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve specialist: ' + error.message);
    }
  }

  async findSpecialistsByStoreId(storeId: number): Promise<Specialist[]> {
    try {
      return await this.specialistRepository.find({
        where: { store: { id: storeId } },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve specialists by store ID: ' + error.message);
    }
  }

  async updateSpecialistImageProfile(id: number, profileImageFile: Multer.File): Promise<Specialist> {
    try {
      const existingSpecialist = await this.findOne(id);
      existingSpecialist.profilePicture = await this.uploadProfileImage(profileImageFile);
      return await this.specialistRepository.save(existingSpecialist);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update specialist profile image: ' + error.message);
    }
  }

  private async uploadProfileImage(file: Multer.File): Promise<string> {
    try {
      const s3 = new S3Client({
        region: 'eu-north-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS,
          secretAccessKey: process.env.AWS_SECRET,
        },
      });

      const key = `${Date.now()}-${file.originalname}`;
      const uploadParams = {
        Bucket: 'caly-app-bucker',
        Key: key,
        Body: file.buffer,
      };

      const result = await s3.send(new PutObjectCommand(uploadParams));

      if (!result) {
        throw new InternalServerErrorException('Error uploading file to S3');
      }

      const fileUrl = `${process.env.AWS_S3_BASE_URL}/${key}`;
      return fileUrl;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload profile image to S3: ' + error.message);
    }
  }

  async findSpecialistsByServiceId(serviceId: number): Promise<Specialist[]> {
    try {
      return await this.specialistRepository.find({
        where: { services: { id: serviceId } },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve specialists by service ID: ' + error.message);
    }
  }

  async findSpecialistsByStoreAndServiceId(storeId: number, serviceId: number): Promise<Specialist[]> {
    try {
      return await this.specialistRepository.find({
        where: { store: { id: storeId }, services: { id: serviceId } },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to find specialists for store ID ${storeId} and service ID ${serviceId}: ` + error.message);
    }
  }

  async update(id: number, updateSpecialistDto: UpdateSpecialistDto): Promise<Specialist> {
    try {
      const existingSpecialist = await this.findOne(id);
      this.specialistRepository.merge(existingSpecialist, updateSpecialistDto);
      return await this.specialistRepository.save(existingSpecialist);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update specialist: ' + error.message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const existingSpecialist = await this.findOne(id);
      await this.specialistRepository.remove(existingSpecialist);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete specialist: ' + error.message);
    }
  }
}
