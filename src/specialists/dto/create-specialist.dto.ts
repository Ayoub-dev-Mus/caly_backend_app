import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Service } from 'src/services/entities/service.entity';
import { Store } from 'src/stores/entities/store.entity';

@ApiExtraModels(Service) // Add model for additional context

export class CreateSpecialistDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    specialty: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    profilePicture?: string;

    @ApiProperty({ type: [Service], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Service)
    services?: Service[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    store: Store;
}

export default CreateSpecialistDto;
