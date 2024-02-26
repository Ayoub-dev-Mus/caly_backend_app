import { ApiProperty } from "@nestjs/swagger";

export class SignUpDto {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    zipCode: string;

    @ApiProperty()
    phoneNumber: string;

    @ApiProperty()
    state: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    role: string;
}