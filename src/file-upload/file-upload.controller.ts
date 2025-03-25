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

  @Delete('deleteImage/:publicId') // Nuevo endpoint para eliminar una imagen
  async deleteImage(@Param('publicId') publicId: string) {
    return this.fileUploadService.deleteImage(publicId);
  }
}

// import {
//   Controller,
//   Param,
//   Post,
//   UseInterceptors,
//   UploadedFile,
//   FileTypeValidator,
//   MaxFileSizeValidator,
//   ParseFilePipe,
// } from '@nestjs/common';
// import { FileUploadService } from './file-upload.service';
// import { FileInterceptor } from '@nestjs/platform-express';

// @Controller('file-upload')
// export class FileUploadController {
//   constructor(private readonly fileUploadService: FileUploadService) {}

//   @Post('uploadImage/:id') //////////////////////////////////
//   @UseInterceptors(FileInterceptor('file')) //////////////////////////////
//   async uploadProduct(
//     @Param('id') id: string,
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({
//             maxSize: 5000000,
//             message: 'El archivo es muy pesado',
//           }),
//           new FileTypeValidator({
//             fileType: /(jpg|jpeg|png|gif|webp)$/i,
//           }),
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//   ) {
//     return this.fileUploadService.uploadProductImage(file, id);
//   }
// }
