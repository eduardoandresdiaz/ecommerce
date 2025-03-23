import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Product } from '../products/products.entity';
import { Category } from '../categories/categories.entity'; // Importa la entidad Category
import { Order } from '../orders/orders.entity';
import { OrderDetail } from '../orders-details/orders-details.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env.development',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Log temporal para verificar las credenciales
        console.log('Credenciales cargadas:', {
          host: configService.get<string>('DB_HOST'),
          port: configService.get<string>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
        });

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT'), 10),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [User, Product, Category, Order, OrderDetail], // Asegúrate de incluir la entidad Category
          synchronize: true, // Cambiar a false para hacer migraciones
          logging: true, // Habilitar logs
        };
      },
    }),
  ],
})
export class typeconfig {}
