import { Order } from '../orders/orders.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Product } from '../products/products.entity';

@Entity()
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @OneToOne(() => Order, (order) => order.orderDetail)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToMany(() => Product)
  @JoinTable({ name: 'order_details_products' })
  products: Product[];
}

