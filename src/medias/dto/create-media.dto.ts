import { ApiProperty } from "@nestjs/swagger"

export class CreateMediaDto {

    @ApiProperty()
    name:string

    @ApiProperty()
    path:string
}
