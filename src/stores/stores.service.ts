import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import CreateStoreDto from './dto/create-store.dto';
import { HttpService } from '@nestjs/axios';
import { StoreType } from './entities/storeType';
import { CreateStoreTypeDto } from './dto/create-store-type.dto';


@Injectable()
export class StoresService {


  @InjectRepository(Store)
  private storeRepository: Repository<Store>;

  @InjectRepository(StoreType)
  private storeTypeRepository: Repository<StoreType>;

  private readonly googleMapsBaseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(private readonly httpService: HttpService) { }


  async drawRoad(from: string, to: string): Promise<any> {
    const response = await this.httpService
      .get(`${this.googleMapsBaseUrl}/directions/json`, {
        params: {
          origin: from,
          destination: to,
          key: 'AIzaSyCxkDMCXkDyX9JpeOdsLUqTJBaLjdsIiBQ',
        },
      }).toPromise();

    if (response && response.data) {
      return response.data;
    }
    return null;
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

  async findAll(): Promise<Store[]> {
    try {
      return await this.storeRepository.find({ relations: ["services", "specialists"] });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllNearestStores(latitude: number, longitude: number): Promise<Store[]> {
    try {
      const result = await this.storeRepository.createQueryBuilder('store')
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

        ])
        .addSelect('ST_Distance(ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, store.location::geography) / 1000 AS distance')
        .leftJoin('store.services', 'services')
        .leftJoin('store.specialists', 'specialists')
        .groupBy('store.id')
        .orderBy('distance')
        .setParameter('longitude', longitude)
        .setParameter('latitude', latitude)
        .getRawMany();

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
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

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<UpdateResult> {
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
