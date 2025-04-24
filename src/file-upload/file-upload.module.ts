import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { FileUploadRepository } from './file-upload.repository';
import { CloudinaryConfig } from '../config/cloudinary';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/products.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User])],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileUploadRepository, CloudinaryConfig],
  exports: [FileUploadService, FileUploadRepository],
})
export class FileUploadModule {}
