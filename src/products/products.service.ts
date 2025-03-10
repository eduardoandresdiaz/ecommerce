import { Injectable } from '@nestjs/common';
import { ProductRepository } from './products.repository';
import { Product } from './products.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(page: number, limit: number): Promise<Product[]> {
    return this.productRepository.getProducts(page, limit);
  }

  async getProductById(id: string): Promise<Product> {
    return await this.productRepository.getProductById(id);
  }

  async createProduct(newCreateProduct: Product): Promise<string> {
    return await this.productRepository.createProduct(newCreateProduct);
  }

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
