import {
  Controller,
  Param,
  Delete,
  Post,
  UseInterceptors,
  UploadedFile,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '../users/user.entity';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('uploadImage/:id') // Endpoint existente para subir una imagen
  @UseInterceptors(FileInterceptor('file'))
  async uploadProduct(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5000000,
            message: 'El archivo es muy pesado',
          }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileUploadService.uploadProductImage(file, id);
  }

  @Post('uploadProfileImage/:userId') // ✅ Definiendo correctamente el endpoint
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Param('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5000000,
            message: 'El archivo es muy pesado',
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileUploadService.uploadProfileImage(file, userId);
  }

  @Delete('deleteImage/:publicId') // ✅ Endpoint para eliminar imágenes
  async deleteImage(@Param('publicId') publicId: string) {
    return this.fileUploadService.deleteImage(publicId);
  }
}
