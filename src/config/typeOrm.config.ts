import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Product } from '../products/products.entity';
import { Category } from '../categories/categories.entity'; // Importa la entidad Category
import { Order } from '../orders/orders.entity';
import { OrderDetail } from '../orders-details/orders-details.entity';
import { ProductRequest } from '../product-requests/product-request.entity';
import { ActivityLog } from '../activity-logs/activity-log.entity';

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
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT'), 10),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [
            User,
            Product,
            Category,
            Order,
            OrderDetail,
            ProductRequest,
            ActivityLog,
          ],
          synchronize: false, // Cambiar a false para hacer migraciones
          logging: true, // Habilitar logs
        };
      },
    }),
  ],
})
export class typeconfig {}
