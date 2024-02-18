import { PartialType } from '@nestjs/swagger';
import { InputType } from '@nestjs/graphql';
import CreateStoreDto from './create-store.dto';


export class UpdateStoreDto extends PartialType(CreateStoreDto) { }
