import { DataSource } from 'typeorm';
import { User } from './users/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'ecommerce',
  entities: [User],
  synchronize: false,
  logging: true,
  migrations: ['src/migrations/*.ts'], // Asegúrate de tener la ruta correcta para las migraciones
});
