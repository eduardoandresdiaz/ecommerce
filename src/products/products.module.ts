import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductRepository } from './products.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Category } from 'src/categories/categories.entity';
import { CategoriesRepository } from '../categories/categories.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    TypeOrmModule.forFeature([Category]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, CategoriesRepository],
})
export class ProductsModule {}
