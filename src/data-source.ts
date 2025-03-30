import { DataSource } from 'typeorm';
import { User } from './users/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost', // Configurable desde variables de entorno
  port: parseInt(process.env.DB_PORT, 10) || 5432, // Configurable desde variables de entorno
  username: process.env.DB_USERNAME || 'postgresa', // Configurable desde variables de entorno
  password: process.env.DB_PASSWORD || '1234', // Configurable desde variables de entorno
  database: process.env.DB_NAME || 'ecommerce', // Configurable desde variables de entorno
  entities: [User],
  synchronize: false, // Asegúrate de usar migraciones en lugar de sincronización automática en producción
  logging: process.env.NODE_ENV !== 'production', // Activar logs solo en desarrollo
  migrations: ['dist/migrations/*.js'], // Asegúrate de compilar migraciones en producción
});
