import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsUrl, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Service } from 'src/services/entities/service.entity';
import { Specialist } from 'src/specialists/entities/specialist.entity';
import { StoreStatus } from '../enums/store.status.enum';

@ApiExtraModels(Specialist, Service) // Add models for additional context

export class CreateStoreDto {
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
    @IsString()
    address: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    city: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    status: StoreStatus;

    @ApiProperty()
    location: { type: string, coordinates: number[] };

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    zipCode: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    state: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    website?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    facebookLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    instagramLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    twitterLink?: string;

    @ApiPropertyOptional({ type: [Specialist] })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Specialist)
    specialists?: Specialist[];

    @ApiPropertyOptional({ type: [Service] })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Service)
    services?: Service[];
}

export default CreateStoreDto;
