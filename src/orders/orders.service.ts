import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async addOrder(userId: string, products: any) {
    const result = await this.ordersRepository.addOrder(userId, products);
    if (!result) {
      throw new NotFoundException('No se pudo crear la orden');
    }
    return result;
  }

  async getOrder(id: string) {
    const order = await this.ordersRepository.getOrders(id);
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }
    return order;
  }
}
