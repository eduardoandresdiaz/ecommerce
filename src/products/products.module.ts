import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductRepository } from './products.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Category } from '../categories/categories.entity';
import { CategoriesRepository } from '../categories/categories.repository';
import { User } from '../users/user.entity';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User]),
    TypeOrmModule.forFeature([Category]),
    ActivityLogsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, CategoriesRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
