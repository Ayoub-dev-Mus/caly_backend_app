import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Service } from 'src/services/entities/service.entity';
import { Store } from 'src/stores/entities/store.entity';

export class CreateOfferDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;


    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;


    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    discount: number;


    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    duration: number;


    @ApiProperty()
    @IsNotEmpty()
    store: Store;


    @ApiProperty()
    @IsNotEmpty()
    service: Service;
}
