import { Injectable } from '@nestjs/common';
import { ProductRepository } from './products.repository';
import { Product } from './products.entity';
//import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(page: number, limit: number): Promise<Product[]> {
    return this.productRepository.getProducts(page, limit);
  }

  async getProductsByCreatorEmail(creatorEmail: string): Promise<Product[]> {
    return await this.productRepository.getProductsByCreatorEmail(creatorEmail);
  }

  async getProductById(id: string): Promise<Product> {
    return await this.productRepository.getProductById(id);
  }

  async createProduct(newCreateProduct: Product): Promise<string> {
    try {
      // Configurar zona horaria manualmente para Argentina (GMT-3)
      const argentinaTimezoneOffset = -3; // Diferencia en horas con respecto a UTC
      const now = new Date(); // Fecha actual en UTC

      // Convertir a la hora local de Argentina
      now.setHours(now.getHours() + argentinaTimezoneOffset);

      // Asignar fechas locales
      newCreateProduct.createdAt = now;
      const expirationDate = new Date(now);
      expirationDate.setDate(now.getDate() + 15); // 15 días después
      newCreateProduct.expiresAt = expirationDate;

      // Enviar al repositorio para guardarlo
      return await this.productRepository.createProduct(newCreateProduct);
    } catch (error) {
      throw new Error('Error creando el producto: ' + error.message);
    }
  }
  // async createProduct(newCreateProduct: Product): Promise<string> {
  //   try {
  //     // Asignar las fechas automáticamente
  //     const timezone = 'America/Argentina/Buenos_Aires';

  //     // Convertir createdAt y expiresAt a la zona horaria local
  //     newCreateProduct.createdAt = toZonedTime(new Date(), timezone); // Fecha actual local
  //     const expirationDate = new Date();
  //     expirationDate.setDate(newCreateProduct.createdAt.getDate() + 15); // 15 días después
  //     newCreateProduct.expiresAt = toZonedTime(expirationDate, timezone);

  //     // Enviar al repositorio para guardarlo
  //     return await this.productRepository.createProduct(newCreateProduct);
  //   } catch (error) {
  //     throw new Error('Error creando el producto: ' + error.message);
  //   }
  // }

  // async createProduct(newCreateProduct: Product): Promise<string> {
  //   // Asignar las fechas automáticamente
  //   newCreateProduct.createdAt = new Date(); // Fecha actual
  //   const expirationDate = new Date();
  //   expirationDate.setDate(newCreateProduct.createdAt.getDate() + 15); // 15 días después
  //   newCreateProduct.expiresAt = expirationDate;

  //   // Enviar al repositorio para guardarlo
  //   return await this.productRepository.createProduct(newCreateProduct);
  // }

  async updateProduct(id: string, newUpdateProduct: Product): Promise<Product> {
    return await this.productRepository.updateProduct(id, newUpdateProduct);
  }

  async deleteProduct(id: string): Promise<Partial<Product>> {
    console.log('ProductService: Eliminando producto...');
    return await this.productRepository.deleteProduct(id);
  }

  async addProducts(): Promise<string> {
    return await this.productRepository.addProducts();
  }
}
