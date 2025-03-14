import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { LoggerMiddleware } from '../middlewares/logger.middleware';
import { User } from './user.entity';
import { CloudinaryConfig } from '../config/cloudinary';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FileUploadModule],
  providers: [UserService, UserRepository, CloudinaryConfig],
  controllers: [UsersController],
  exports: [UserService, UserRepository],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('users');
  }
}
