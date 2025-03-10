import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from 'src/orders-details/orders-details.entity';
import { Order } from './orders.entity';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/products.entity';
import { OrdersRepository } from './orders.repository';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([OrderDetail]),
    TypeOrmModule.forFeature([Order]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Product]),
  ],
  providers: [OrdersService, OrdersRepository],
  controllers: [OrdersController],
})
export class OrdersModule {}
