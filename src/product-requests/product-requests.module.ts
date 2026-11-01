import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductRequest } from './product-request.entity';
import { ProductRequestsService } from './product-requests.service';
import { ProductRequestsController } from './product-requests.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductRequest,
      User,
    ]),
  ],

  controllers: [
    ProductRequestsController,
  ],

  providers: [
    ProductRequestsService,
  ],

  exports: [
    ProductRequestsService,
  ],
})
export class ProductRequestsModule {}