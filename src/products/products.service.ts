import { Injectable } from '@nestjs/common';
import { ProductRepository } from './products.repository';
import { Product } from './products.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  // Método para obtener productos con paginación
  async getProducts(page: number, limit: number): Promise<Product[]> {
    return this.productRepository.getProducts(page, limit);
  }

  // Método para obtener productos por correo del creador
  async getProductsByCreatorEmail(creatorEmail: string): Promise<Product[]> {
    return await this.productRepository.getProductsByCreatorEmail(creatorEmail);
  }

  // Método para obtener un producto por su ID
  async getProductById(id: string): Promise<Product> {
    return await this.productRepository.getProductById(id);
  }

  /**
   * Método para crear un nuevo producto.
   * - Se ajustan las fechas `createdAt` y `expiresAt` para la zona horaria de Argentina.
   * - Las fechas ya quedan en hora local antes de enviarse al repositorio.
   */
  async createProduct(newCreateProduct: Product): Promise<string> {
    try {
      // Configurar zona horaria manualmente para Argentina (GMT-3)
      const argentinaTimezoneOffset = -3; // Diferencia en horas con respecto a UTC
      const now = new Date(); // Fecha actual en UTC

      // Convertir a la hora local de Argentina
      now.setHours(now.getHours() + argentinaTimezoneOffset);

      // Asignar fechas locales
      newCreateProduct.createdAt = now; // Hora local de creación
      const expirationDate = new Date(now); // Calculando la fecha de expiración
      expirationDate.setDate(now.getDate() + 15); // 15 días después
      newCreateProduct.expiresAt = expirationDate;

      // Enviar al repositorio para guardar el producto
      return await this.productRepository.createProduct(newCreateProduct);
    } catch (error) {
      /**
       * Validación para que TypeScript no arroje errores cuando se accede a `error.message`.
       * Si el objeto `error` no es del tipo `Error`, se convierte a cadena con `String(error)`.
       */
      if (error instanceof Error) {
        throw new Error('Error creando el producto: ' + error.message);
      } else {
        throw new Error('Error creando el producto: ' + String(error));
      }
    }
  }

  /**
   * Método comentado previamente: Este utiliza una librería externa para la zona horaria.
   * Actualmente no está en uso debido a las dependencias que podrían generar conflictos.
   */
  // async createProduct(newCreateProduct: Product): Promise<string> {
  //   try {
  //     // Asignar las fechas automáticamente usando una librería de zonas horarias
  //     const timezone = 'America/Argentina/Buenos_Aires';

  //     // Convertir createdAt y expiresAt a la zona horaria local
  //     newCreateProduct.createdAt = toZonedTime(new Date(), timezone); // Fecha actual local
  //     const expirationDate = new Date();
  //     expirationDate.setDate(newCreateProduct.createdAt.getDate() + 15); // 15 días después
  //     newCreateProduct.expiresAt = toZonedTime(expirationDate, timezone);

  //     // Enviar al repositorio para guardarlo
  //     return await this.productRepository.createProduct(newCreateProduct);
  //   } catch (error) {
  //     /**
  //      * Validación del error. Si se encuentra un problema, se lanza la excepción con mensaje.
  //      */
  //     throw new Error('Error creando el producto: ' + error.message);
  //   }
  // }

  /**
   * Método anterior básico (sin ajustes de zona horaria).
   * Este método simplemente asigna las fechas sin considerar zonas horarias.
   */
  // async createProduct(newCreateProduct: Product): Promise<string> {
  //   // Asignar las fechas automáticamente
  //   newCreateProduct.createdAt = new Date(); // Fecha actual
  //   const expirationDate = new Date();
  //   expirationDate.setDate(newCreateProduct.createdAt.getDate() + 15); // 15 días después
  //   newCreateProduct.expiresAt = expirationDate;

  //   // Enviar al repositorio para guardarlo
  //   return await this.productRepository.createProduct(newCreateProduct);
  // }

  /**
   * Método para actualizar un producto existente.
   * El repositorio maneja la lógica de actualización.
   */
  async updateProduct(id: string, newUpdateProduct: Product): Promise<Product> {
    return await this.productRepository.updateProduct(id, newUpdateProduct);
  }

  /**
   * Método para eliminar un producto.
   * Se imprime un mensaje en consola antes de proceder.
   */
  async deleteProduct(id: string): Promise<Partial<Product>> {
    console.log('ProductService: Eliminando producto...');
    return await this.productRepository.deleteProduct(id);
  }

  /**
   * Método para añadir productos de ejemplo.
   * Utilizado para propósitos de seeding.
   */
  async addProducts(): Promise<string> {
    return await this.productRepository.addProducts();
  }
}
