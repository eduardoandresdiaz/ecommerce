import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `Estás ejecutando un método ${req.method} en la ruta ${req.url} ${new Date().toLocaleTimeString()}`,
    );
    next();
  }
}

export function loggerGlobal(req: Request, res: Response, next: NextFunction) {
  console.log(
    `Estás ejecutando un método ${req.method} en la ruta ${req.url}  a las ${new Date().toLocaleTimeString()}`,
  );

  // if (req.url === '/') {
  //   res.json({ mesage: 'esta es una api de ecomerce' });

  next();
}
