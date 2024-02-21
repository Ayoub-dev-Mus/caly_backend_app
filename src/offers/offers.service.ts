import { Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OffersService {

  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) { }

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    const newOffer = this.offerRepository.create(createOfferDto);
    return this.offerRepository.save(newOffer);
  }

  async findAll(): Promise<Offer[]> {
    return this.offerRepository.find({ relations: ['store.specialists', 'store.services' , "store"] });
  }

  async findOne(id: number): Promise<Offer> {
    return this.offerRepository.findOne({ where: { id } });
  }

  async update(id: number, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    const offerToUpdate = await this.offerRepository.findOne({ where: { id } });
    if (!offerToUpdate) {
      throw new Error(`Offer with id ${id} not found`);
    }
    this.offerRepository.merge(offerToUpdate, updateOfferDto);
    return this.offerRepository.save(offerToUpdate);
  }

  async remove(id: number): Promise<void> {
    const offerToRemove = await this.offerRepository.findOne({ where: { id } });
    if (!offerToRemove) {
      throw new Error(`Offer with id ${id} not found`);
    }
    await this.offerRepository.remove(offerToRemove);
  }
}
