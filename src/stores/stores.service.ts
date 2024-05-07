import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import {
  Brackets,
  DeleteResult,
  FindManyOptions,
  ILike,
  Repository,
  UpdateResult,
} from 'typeorm';
import CreateStoreDto from './dto/create-store.dto';
import { HttpService } from '@nestjs/axios';
import { StoreType } from './entities/storeType';
import { CreateStoreTypeDto } from './dto/create-store-type.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class StoresService {
  @InjectRepository(Store)
  private storeRepository: Repository<Store>;

  @InjectRepository(StoreType)
  private storeTypeRepository: Repository<StoreType>;

  private readonly googleMapsBaseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
  ) { }

  async drawRoad(from: string, to: string): Promise<any> {
    try {
      const response = await this.httpService
        .get(`${this.googleMapsBaseUrl}/directions/json`, {
          params: {
            origin: from,
            destination: to,
            key: 'AIzaSyCxkDMCXkDyX9JpeOdsLUqTJBaLjdsIiBQ',
          },
        })
        .toPromise();

      if (response && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllStoreTypes(): Promise<StoreType[]> {
    try {
      return await this.storeTypeRepository.find();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createStoreType(storeType: CreateStoreTypeDto): Promise<StoreType> {
    try {
      return await this.storeTypeRepository.save(storeType);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    try {
      return await this.storeRepository.save(createStoreDto);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = '',
  ): Promise<{ stores: Store[]; total: number }> {
    try {

      const cacheKey = `stores:all:${page}:${pageSize}:${searchTerm}`;

      try {
        const cachedResult = await this.redisService.get(cacheKey);

        Logger.log('cachedResult', cachedResult);

        if (cachedResult) {
          return JSON.parse(cachedResult);
        }
      } catch (error) {
        console.error('Error accessing Redis:', error);
      }

      try {
        const options: FindManyOptions<Store> = {
          relations: ['services', 'specialists'],
          where: searchTerm ? [{ name: ILike(`%${searchTerm}%`) }] : {},
          take: pageSize,
          skip: (page - 1) * pageSize,
        };

        const [stores, total] = await this.storeRepository.findAndCount(options);

        try {
          await this.redisService.set(
            cacheKey,
            JSON.stringify({ stores, total }),
          );
        } catch (error) {
          console.error('Error setting cache in Redis:', error);
        }

        return { stores, total };
      } catch (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllNearestStores(
    latitude: number,
    longitude: number,
    searchTerm: string = '',
    page: number = 1,
    pageSize: number = 10,
    storeType?: string, //
  ): Promise<{ stores: Store[]; total: number }> {
    try {
      let queryBuilder = this.storeRepository
        .createQueryBuilder('store')
        .select([
          'store.id as id',
          'store.name as name',
          'store.description as description',
          'store.address as address',
          'store.city as city',
          'store.status as status',
          'store.zipCode as zipCode',
          'store.state as state',
          'store.phone as phone',
          'store.email as email',
          'ST_X(store.location) as longitude',
          'ST_Y(store.location) as latitude',
          'store.website as website',
          'store.createdAt as createdAt',
          'store.updatedAt as updatedAt',
          'json_agg(store.images) AS images',
          'store.facebookLink as facebookLink',
          'store.instagramLink as instagramLink',
          'store.twitterLink as twitterLink',
          'json_agg(services) AS services',
          'json_agg(specialists) AS specialists',
          `json_build_object('id', type.id, 'label', type.label, 'icon', type.icon) AS type`,
        ])
        .addSelect(
          'ST_Distance(ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, store.location::geography) / 1000 AS distance',
        ) // Convert distance to kilometers
        .leftJoin('store.services', 'services')
        .leftJoin('store.specialists', 'specialists')
        .leftJoin('store.type', 'type')
        .where(
          new Brackets((qb) => {
            qb.where('LOWER(store.name) LIKE LOWER(:searchTerm)', {
              searchTerm: `%${searchTerm}%`,
            }).orWhere('LOWER(store.description) LIKE LOWER(:searchTerm)', {
              searchTerm: `%${searchTerm}%`,
            });
          }),
        );

      if (storeType) {
        queryBuilder = queryBuilder.andWhere('type.id = :storeTypeId', {
          storeTypeId: storeType,
        });
      }

      const totalCount = await queryBuilder
        .groupBy('store.id, type.id, type.label, type.icon')
        .setParameter('longitude', longitude)
        .setParameter('latitude', latitude)
        .getCount();

      const result = await queryBuilder
        .orderBy('distance')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getRawMany();

      return { stores: result, total: totalCount };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllNearestStoresCached(
    latitude: number,
    longitude: number,
    searchTerm: string = '',
    page: number = 1,
    pageSize: number = 10,
    storeType?: string,
  ): Promise<{ stores: Store[]; total: number }> {
    const cacheKey = `stores:nearest:${latitude}:${longitude}:${searchTerm}:${page}:${pageSize}:${storeType || 'all'}`;

    try {
      const cachedResult = await this.redisService.get(cacheKey);

      Logger.log('cachedResult', cachedResult);

      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
    } catch (error) {
      console.error('Error accessing Redis:', error);
    }

    let queryBuilder = this.storeRepository
      .createQueryBuilder('store')
      .select([
        'store.id as id',
        'store.name as name',
        'store.description as description',
        'store.address as address',
        'store.city as city',
        'store.status as status',
        'store.zipCode as zipCode',
        'store.state as state',
        'store.phone as phone',
        'store.email as email',
        'ST_X(store.location) as longitude',
        'ST_Y(store.location) as latitude',
        'store.website as website',
        'store.createdAt as createdAt',
        'store.updatedAt as updatedAt',
        'json_agg(store.images) AS images',
        'store.facebookLink as facebookLink',
        'store.instagramLink as instagramLink',
        'store.twitterLink as twitterLink',
        'json_agg(services) AS services',
        'json_agg(specialists) AS specialists',
        `json_build_object('id', type.id, 'label', type.label, 'icon', type.icon) AS type`,
      ])
      .addSelect(
        'ST_Distance(ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, store.location::geography) / 1000 AS distance',
      ) 
      .leftJoin('store.services', 'services')
      .leftJoin('store.specialists', 'specialists')
      .leftJoin('store.type', 'type')
      .where(
        new Brackets((qb) => {
          qb.where('LOWER(store.name) LIKE LOWER(:searchTerm)', {
            searchTerm: `%${searchTerm}%`,
          }).orWhere('LOWER(store.description) LIKE LOWER(:searchTerm)', {
            searchTerm: `%${searchTerm}%`,
          });
        }),
      );

    if (storeType) {
      queryBuilder = queryBuilder.andWhere('type.id = :storeTypeId', {
        storeTypeId: storeType,
      });
    }

    const totalCount = await queryBuilder
      .groupBy('store.id, type.id, type.label, type.icon')
      .setParameter('longitude', longitude)
      .setParameter('latitude', latitude)
      .getCount();

    const result = await queryBuilder
      .orderBy('distance')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany();
    try {
      await this.redisService.set(
        cacheKey,
        JSON.stringify({ stores: result, total: totalCount }),
      );
    } catch (error) {
      console.error('Error setting cache in Redis:', error);

    }

    return { stores: result, total: totalCount };
  }

  async findOne(id: number): Promise<Store> {
    try {
      const store = await this.storeRepository.findOne({ where: { id } });
      if (!store) {
        throw new NotFoundException('Store not found.');
      }
      return store;
    } catch (error) {
      throw new Error('Failed to retrieve store.');
    }
  }

  async update(
    id: number,
    updateStoreDto: UpdateStoreDto,
  ): Promise<UpdateResult> {
    try {
      return await this.storeRepository.update({ id }, updateStoreDto);
    } catch (error) {
      throw new Error('Failed to update store.');
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      return await this.storeRepository.delete({ id });
    } catch (error) {
      throw new Error('Failed to delete store.');
    }
  }
}
