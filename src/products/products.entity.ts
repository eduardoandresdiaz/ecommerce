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
      'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1742769896/cyi4pszz0ighbcdgpujw.jpg',
  })
  imgUrl: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
    default: 'default@example.com',
  })
  creatorEmail: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 15,
    default: null,
  })
  telefono: string; // Número de teléfono del vendedor

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date;
  @Column({ default: true })
  mostrarprecio: boolean;

  @Column({ default: false })
  resaltaroferta: boolean;

  @Column({ default: false })
  nopublicable: boolean;

  @Column({ length: 100, nullable: true })
  proveedor: string;

  @Column({
    type: 'int',
    default: 0,
    nullable: true,
  })
  stockminimo: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  ubicacion: string;


  @ManyToMany(() => OrderDetail, (orderDetail) => orderDetail.products)
  orderDetail: OrderDetail[];

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
