import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/products.entity';
import { Category } from 'src/categories/categories.entity'; // Importa la entidad Category
import { Order } from 'src/orders/orders.entity';
import { OrderDetail } from 'src/orders-details/orders-details.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env.development',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Product, Category, Order, OrderDetail], // Asegúrate de incluir la entidad Category
        synchronize: true, //sacar para hacer migraciones
        logging: true,
      }),
    }),
  ],
})
export class typeconfig {}
