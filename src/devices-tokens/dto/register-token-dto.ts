import { ApiProperty } from "@nestjs/swagger";

export class RegisterTokenDto {

  @ApiProperty()
  token: string;
}
