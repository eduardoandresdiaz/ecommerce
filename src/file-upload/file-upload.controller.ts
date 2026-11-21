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
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    merchantOwnerEmail?: string;
    isadmin?: boolean;
  };
}

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  private getMerchantEmail(request: AuthenticatedRequest): string {
    const email = request.user?.merchantOwnerEmail ?? request.user?.email;
    if (!email) {
      throw new UnauthorizedException('No se pudo identificar al comercio.');
    }
    return email;
  }

  @Post('uploadImage/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProduct(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
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
    await this.fileUploadService.assertProductBelongsToMerchant(
      id,
      this.getMerchantEmail(request),
    );
    return this.fileUploadService.uploadProductImage(file, id);
  }

  @Post('uploadProfileImage/:userId')
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

  @Delete('deleteImage/:productId/:publicId')
  @UseGuards(AuthGuard)
  async deleteImage(
    @Param('productId') productId: string,
    @Param('publicId') publicId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.fileUploadService.assertProductImageBelongsToMerchant(
      publicId,
      this.getMerchantEmail(request),
      productId,
    );
    return this.fileUploadService.deleteImage(publicId);
  }

  @Delete('deleteProfileImage/:publicId') // ✅ ESTE
  @UseGuards(AuthGuard)
  async deleteProfileImage(
    @Param('publicId') publicId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!request.user?.id) {
      throw new UnauthorizedException('No se pudo identificar al usuario.');
    }
    await this.fileUploadService.assertProfileImageBelongsToUser(
      publicId,
      request.user.id,
    );
    return this.fileUploadService.deleteImage(publicId);
  }
}

// import {
//   Controller,
//   Param,
//   Delete,
//   Post,
//   UseInterceptors,
//   UploadedFile,
//   FileTypeValidator,
//   MaxFileSizeValidator,
//   ParseFilePipe,
// } from '@nestjs/common';
// import { FileUploadService } from './file-upload.service';
// import { FileInterceptor } from '@nestjs/platform-express';
// //import { User } from '../users/user.entity';

// @Controller('file-upload')
// export class FileUploadController {
//   constructor(private readonly fileUploadService: FileUploadService) {}

//   @Post('uploadImage/:id') // Endpoint existente para subir una imagen
//   @UseInterceptors(FileInterceptor('file'))
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

//   @Post('uploadProfileImage/:userId') // ✅ Definiendo correctamente el endpoint
//   @UseInterceptors(FileInterceptor('file'))
//   async uploadProfileImage(
//     @Param('userId') userId: string,
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({
//             maxSize: 5000000,
//             message: 'El archivo es muy pesado',
//           }),
//           new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/i }),
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//   ) {
//     return this.fileUploadService.uploadProfileImage(file, userId);
//   }

//   @Delete('deleteImage/:publicId') // ✅ Endpoint para eliminar imágenes
//   async deleteImage(@Param('publicId') publicId: string) {
//     return this.fileUploadService.deleteImage(publicId);
//   }
// }
