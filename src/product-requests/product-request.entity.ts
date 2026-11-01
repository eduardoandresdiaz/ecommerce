import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  import { User } from 'src/users/user.entity';
  
  export type ProductRequestStatus =
    | 'PENDIENTE'
    | 'PEDIDO'
    | 'RECIBIDO'
    | 'CANCELADO';
  
  @Entity({ name: 'product_requests' })
  export class ProductRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({
      name: 'owner_id',
      type: 'uuid',
      nullable: false,
    })
    ownerId: string;
  
    @ManyToOne(
      () => User,
      (user) => user.productRequests,
      {
        nullable: false,
        onDelete: 'CASCADE',
      },
    )
    @JoinColumn({ name: 'owner_id' })
    owner: User;
  
    @Column({
      name: 'supplier_name',
      type: 'varchar',
      length: 100,
      nullable: false,
    })
    supplierName: string;
  
    @Column({
      name: 'product_detail',
      type: 'text',
      nullable: false,
    })
    productDetail: string;
  
    @Column({
      name: 'current_stock',
      type: 'integer',
      nullable: false,
      default: 0,
    })
    currentStock: number;
  
    @Column({
      name: 'requested_quantity',
      type: 'integer',
      nullable: false,
    })
    requestedQuantity: number;
  
    @Column({
      name: 'requested_at',
      type: 'timestamp without time zone',
      nullable: false,
      default: () => 'CURRENT_TIMESTAMP',
    })
    requestedAt: Date;
  
    @Column({
      type: 'varchar',
      length: 20,
      nullable: false,
      default: 'PENDIENTE',
    })
    status: ProductRequestStatus;
  
    @Column({
      name: 'ordered_at',
      type: 'timestamp without time zone',
      nullable: true,
    })
    orderedAt: Date | null;
  
    @CreateDateColumn({
      name: 'created_at',
      type: 'timestamp without time zone',
      default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
  
    @UpdateDateColumn({
      name: 'updated_at',
      type: 'timestamp without time zone',
      default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
  }