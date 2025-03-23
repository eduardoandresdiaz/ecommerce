import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Category } from '../categories/categories.entity';
import { OrderDetail } from '../orders-details/orders-details.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
    length: 50,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  stock: number;

  @Column({
    type: 'text',
    default:
      'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1742432341/sinimagen_cjoinh.webp',
  })
  imgUrl: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
    default: 'defaull@example.com',
  })
  creatorEmail: string; // Nuevo campo para el correo del creador

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date; // Fecha automática de creación

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date; // Fecha de expiración calculada automáticamente

  @ManyToMany(() => OrderDetail, (orderDetail) => orderDetail.products)
  orderDetail: OrderDetail[];

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
