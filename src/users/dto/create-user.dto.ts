import { IsString, Length, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'John', description: 'The first name of the user' })
    @IsString()
    @Length(4, 20)
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
    @IsString()
    @Length(4, 20)
    lastName: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'The email address of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123 Main St', description: 'The address of the user' })
    @IsString()
    @Length(4, 50)
    address: string;

    @ApiProperty({ example: '12345', description: 'The ZIP code of the user' })
    @IsString()
    @Length(4, 20)
    zipCode: string;

    @ApiProperty({ example: 'CA', description: 'The state of the user' })
    @IsString()
    @Length(4, 20)
    state: string;

    @ApiProperty({ example: 'password123', description: 'The password of the user' })
    @IsString()
    @Length(4)
    password: string;

    @IsString()
    @IsOptional()
    phoneNumber: string;

    @IsString()
    @IsOptional()
    profilePicture: string | null;

@ApiProperty({ example: 'user', description: 'The role of the user' })
@IsString()
@Length(8, 20)
role: string;


}
