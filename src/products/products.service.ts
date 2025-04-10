import { Injectable } from '@nestjs/common';
import { ProductRepository } from './products.repository';
import { Product } from './products.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}
  async findProductsByKeywords(keywords: string): Promise<Product[]> {
    return await this.productRepository.findProductsByKeywords(keywords);
  }

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
    return await this.productRepository.createProduct(newCreateProduct);
  }

  async updateProduct(
    id: string,
    updateData: Partial<Product>,
  ): Promise<Product> {
    return await this.productRepository.updateProduct(id, updateData);
  }

  async deleteProduct(id: string): Promise<Partial<Product>> {
    return await this.productRepository.deleteProduct(id);
  }

  async addProducts(): Promise<string> {
    return await this.productRepository.addProducts();
  }
}
