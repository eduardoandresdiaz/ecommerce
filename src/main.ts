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
  const SwaggerConfig = new DocumentBuilder()
    .setTitle('E-commerce')
    .setDescription('API para e-commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, SwaggerConfig);
  SwaggerModule.setup('api', app, document);
  app.use(loggerGlobal);
  const loggerMiddleware = new LoggerMiddleware();
  app.use(loggerMiddleware.use);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
