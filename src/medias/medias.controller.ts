import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MediasService } from './medias.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@ApiTags("Medias")
@Controller('medias')
export class MediasController {
  constructor(private readonly mediasService: MediasService) { }

  @Post()
  create(@Body() createMediaDto: CreateMediaDto,
  ) {
    return this.mediasService.create(createMediaDto);
  }

  @Post("icon")
  @UseInterceptors(FileInterceptor('path'))
  createIcon(@Body()  createMediaDto:CreateMediaDto  , @UploadedFile() icon?: Multer.File) {
    try{
      return this.mediasService.createIcon(createMediaDto,icon)
    }catch(e){
      return e.message
    }
  }

  @Get('icons')
  async getIcons(){
    try{
      return this.mediasService.findAllIcons()
    }catch(e){
      return e.message
    }
  }

  @Get()
  findAll() {
    return this.mediasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediasService.update(+id, updateMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediasService.remove(+id);
  }
}
