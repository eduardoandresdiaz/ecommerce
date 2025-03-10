import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrderDto } from 'src/dto/create-order.dto';
import { OrdersService } from './orders.service';
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}
  @Post()
  addOrder(@Body() order: CreateOrderDto) {
    const { userId, products } = order;
    return this.ordersService.addOrder(userId, products);
  }
  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }
  
}

