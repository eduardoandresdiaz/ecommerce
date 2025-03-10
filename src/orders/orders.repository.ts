import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/products.entity';
import { OrderDetail } from 'src/orders-details/orders-details.entity';
import { User } from 'src/users/user.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private ordersDetailsRepository: Repository<OrderDetail>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async addOrder(userId: string, products: any) {
    let total = 0;
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      return 'Usuario no encontrado';
    }
    const order = new Order();
    order.date = new Date();
    order.user = user;

    const newOrder = await this.ordersRepository.save(order);
    const productsArray = await Promise.all(
      products.map(async (element) => {
        const product = await this.productRepository.findOneBy({
          id: element.id,
        });
        if (!product) {
          return 'Producto no encontrado';
        }
        total += Number(product.price);
        await this.productRepository.update(
          { id: element.id },
          { stock: product.stock - 1 },
        );
        return product;
      }),
    );
    const orderDetail = new OrderDetail();

    orderDetail.price = Number(Number(total).toFixed(2));
    orderDetail.order = newOrder;
    orderDetail.products = productsArray;

    await this.ordersDetailsRepository.save(orderDetail);
    return await this.ordersRepository.find({
      where: { id: newOrder.id },
      relations: {
        orderDetail: true,
      },
    });
  }
  getOrders(id: string) {
    const order = this.ordersRepository.findOne({
      where: { id },
      relations: {
        orderDetail: {
          products: true,
        },
      },
    });
    if (!order) {
      return 'orden no encontrada';
    }
    return order;
  }
}
