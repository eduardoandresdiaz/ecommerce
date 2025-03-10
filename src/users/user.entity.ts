import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../orders/orders.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 60, nullable: false }) // Aumenta el tamaño a 60
  password: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string; // Mantener como VARCHAR para evitar problemas con ceros iniciales

  @Column({ type: 'varchar', length: 50, nullable: true }) // Aumenta el tamaño a 50
  country: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string;

  @Column({ type: 'boolean', default: false })
  isAdmin?: boolean;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
