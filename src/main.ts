import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  loggerGlobal,
  LoggerMiddleware,
} from './middlewares/logger.middleware';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const SwaggerConfig = new DocumentBuilder()
    .setTitle('E-commerce')
    .setDescription('API para e-commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, SwaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Habilitar CORS con múltiples orígenes permitidos
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://conlara.onrender.com',
      'https://conlara.com.ar',
    ], // Agrega todos los dominios permitidos
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Middleware y Validación Global
  app.use(loggerGlobal);
  const loggerMiddleware = new LoggerMiddleware();
  app.use(loggerMiddleware.use);
  app.useGlobalPipes(new ValidationPipe());
  console.log('Zona horaria configurada:', process.env.TZ || 'No configurada');
  console.log('Hora local según el backend:', new Date().toLocaleString());

  //Manejo de preflight requests CORS (Opciones)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    '🚀 Servidor backend iniciado en el puerto:',
    process.env.PORT ?? 3000,
  );
}
bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import {
//   loggerGlobal,
//   LoggerMiddleware,
// } from './middlewares/logger.middleware';
// import { ValidationPipe } from '@nestjs/common';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Configuración de Swagger
//   const SwaggerConfig = new DocumentBuilder()
//     .setTitle('E-commerce')
//     .setDescription('API para e-commerce')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();
//   const document = SwaggerModule.createDocument(app, SwaggerConfig);
//   SwaggerModule.setup('api', app, document);

//   // Habilitar CORS con múltiples orígenes permitidos
//   app.enableCors({
//     origin: [
//       'http://localhost:5173',
//       'https://conlara.onrender.com',
//       'https://conlara.com.ar',
//     ], // Agrega todos los dominios permitidos
//     methods: 'GET,POST,PUT,DELETE,OPTIONS',
//     allowedHeaders: 'Content-Type, Authorization',
//   });

//   // Middleware y Validación Global
//   app.use(loggerGlobal);
//   const loggerMiddleware = new LoggerMiddleware();
//   app.use(loggerMiddleware.use);
//   app.useGlobalPipes(new ValidationPipe());
//   console.log('Zona horaria configurada:', process.env.TZ || 'No configurada');
//   console.log('Hora local según el backend:', new Date().toLocaleString());

//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import {
//   loggerGlobal,
//   LoggerMiddleware,
// } from './middlewares/logger.middleware';
// import { ValidationPipe } from '@nestjs/common';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Configuración de Swagger
//   const SwaggerConfig = new DocumentBuilder()
//     .setTitle('E-commerce')
//     .setDescription('API para e-commerce')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();
//   const document = SwaggerModule.createDocument(app, SwaggerConfig);
//   SwaggerModule.setup('api', app, document);

//   // Habilitar CORS
//   app.enableCors({
//     origin: 'http://localhost:5173', // Cambia esto según la URL de tu frontend
//     methods: 'GET,POST,PUT,DELETE,OPTIONS',
//     allowedHeaders: 'Content-Type, Authorization',
//   });

//   // Middleware y Validación Global
//   app.use(loggerGlobal);
//   const loggerMiddleware = new LoggerMiddleware();
//   app.use(loggerMiddleware.use);
//   app.useGlobalPipes(new ValidationPipe());

//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import {
//   loggerGlobal,
//   LoggerMiddleware,
// } from './middlewares/logger.middleware';
// import { ValidationPipe } from '@nestjs/common';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const SwaggerConfig = new DocumentBuilder()
//     .setTitle('E-commerce')
//     .setDescription('API para e-commerce')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();
//   const document = SwaggerModule.createDocument(app, SwaggerConfig);
//   SwaggerModule.setup('api', app, document);
//   app.use(loggerGlobal);
//   const loggerMiddleware = new LoggerMiddleware();
//   app.use(loggerMiddleware.use);
//   app.useGlobalPipes(new ValidationPipe());
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();
