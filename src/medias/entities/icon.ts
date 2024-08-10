import { ChildEntity } from "typeorm";
import { Media } from "./media.entity";

@ChildEntity()
export class Icon extends Media{
    
}