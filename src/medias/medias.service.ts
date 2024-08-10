import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { Icon } from './entities/icon';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Multer } from 'multer';
import { Message } from '../chats/entities/chat.shema';

@Injectable()
export class MediasService {

  constructor(
    @InjectRepository(Icon)
    private readonly iconRepository: Repository<Icon>,
  ) { }

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

  create(createMediaDto: CreateMediaDto) {
    return 'This action adds a new media';
  }

  async createIcon(createMediaDto: CreateMediaDto, icon?: Multer.File) {
    try {
      const { path, ...rest } = createMediaDto;
      const newIcon = this.iconRepository.create(rest);
      if (icon) {
        newIcon.path = await this.uploadProfileImage(icon);
      }
      return newIcon
    } catch (e) {
      throw new InternalServerErrorException('failed to create icon ' + e.message);
    }
  }


  findAll() {
    return `This action returns all medias`;
  }

  findOne(id: number) {
    return `This action returns a #${id} media`;
  }

  update(id: number, updateMediaDto: UpdateMediaDto) {
    return `This action updates a #${id} media`;
  }

  remove(id: number) {
    return `This action removes a #${id} media`;
  }
}
