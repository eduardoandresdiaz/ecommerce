import { Injectable } from '@nestjs/common';

@Injectable();
export class AppService {
  getHello(): string {
    return 'Hello E.Comerce Api ';
  }
}