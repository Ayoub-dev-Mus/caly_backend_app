import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { Specialist } from './entities/specialist.entity';
import CreateSpecialistDto from './dto/create-specialist.dto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Multer } from 'multer'
@Injectable()
export class SpecialistsService {
  constructor(
    @InjectRepository(Specialist)
    private specialistRepository: Repository<Specialist>,
  ) { }

  async create(createSpecialistDto: CreateSpecialistDto, profileImageFile?: Multer.File): Promise<Specialist> {
    const { profilePicture, ...rest } = createSpecialistDto;
    const newSpecialist = this.specialistRepository.create(rest);

    if (profileImageFile) {
      newSpecialist.profilePicture = await this.uploadProfileImage(profileImageFile);
    }

    return await this.specialistRepository.save(newSpecialist);
  }
  async findAll(): Promise<Specialist[]> {
    return await this.specialistRepository.find();
  }

  async findOne(id: number): Promise<Specialist> {
    const specialist = await this.specialistRepository.findOne({
      where: { id },
    });
    if (!specialist) {
      throw new NotFoundException(`Specialist with ID ${id} not found`);
    }
    return specialist;
  }

  async findSpecialistsByStoreId(storeId: number): Promise<Specialist[]> {
    return await this.specialistRepository.find({
      where: { store: { id: storeId } },
    });
  }
  async updateSpecialistImageProfile(
    id: number,
    profileImageFile: Multer.File,
  ): Promise<Specialist> {
    const existingSpecialist = await this.findOne(id);
    existingSpecialist.profilePicture = await this.uploadProfileImage(profileImageFile);
    return await this.specialistRepository.save(existingSpecialist);
  }

  private async uploadProfileImage(file: Multer.File): Promise<string> {
    try {
      const s3 = new S3Client({
        region: 'eu-north-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
        throw new Error('Error uploading file to S3');
      }

      const fileUrl = `${process.env.AWS_S3_BASE_URL}/${key}`; // Construct the full URL
      return fileUrl;
    } catch (error) {
      throw new Error('Failed to upload profile image to S3');
    }
  }

  async findSpecialistsByServiceId(serviceId: number): Promise<Specialist[]> {
    return await this.specialistRepository.find({
      where: { services: { id: serviceId } },
    });
  }
  async findSpecialistsByStoreAndServiceId(
    storeId: number,
    serviceId: number,
  ): Promise<Specialist[]> {
    try {
      return await this.specialistRepository.find({
        where: { store: { id: storeId }, services: { id: serviceId } },
      });
    } catch (error) {
      throw new Error(
        `Failed to find specialists for store ID ${storeId} and service ID ${serviceId}`,
      );
    }
  }
  async update(
    id: number,
    updateSpecialistDto: UpdateSpecialistDto,
  ): Promise<Specialist> {
    const existingSpecialist = await this.findOne(id);
    this.specialistRepository.merge(existingSpecialist, updateSpecialistDto);
    return await this.specialistRepository.save(existingSpecialist);
  }

  async remove(id: number): Promise<void> {
    const existingSpecialist = await this.findOne(id);
    await this.specialistRepository.remove(existingSpecialist);
  }
}
