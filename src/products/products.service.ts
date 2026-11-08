import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ProductRepository } from './products.repository';
import { Product } from './products.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) { }
  async findProductsByKeywords(keywords: string): Promise<Product[]> {
    return await this.productRepository.findProductsByKeywords(keywords);
  }
  async getProducts(
    page: number,
    limit: number,
    category?: string,
  ): Promise<Product[]> {
    return this.productRepository.getProducts(
      page,
      limit,
      category,
    );
  }
  async generateSitemap(): Promise<string> {
    const products =
      await this.productRepository.getProductsForSitemap();

    const staticUrls = [
      'https://conlara.com.ar/',
      'https://conlara.com.ar/productos',
      'https://conlara.com.ar/servicios',
      'https://conlara.com.ar/sobre-nosotros',
      'https://conlara.com.ar/infoNaschel',
      'https://conlara.com.ar/infoLaToma',
      'https://conlara.com.ar/historiaNaschel',
      'https://conlara.com.ar/historiaLaToma',
    ];

    const staticEntries = staticUrls
      .map(
        (url) => `
  <url>
    <loc>${url}</loc>
  </url>`,
      )
      .join('');

    const productEntries = products
      .map(
        (product) => `
  <url>
    <loc>https://conlara.com.ar/productos/${product.id}</loc>
    <lastmod>${new Date(product.createdAt)
            .toISOString()
            .split('T')[0]}</lastmod>
  </url>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${productEntries}
</urlset>`;
  }



  // async getProducts(page: number, limit: number): Promise<Product[]> {
  //   return this.productRepository.getProducts(page, limit);
  // }

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
  async updateStock(id: string, stock: number): Promise<Product> {
    const product = await this.productRepository.getProductById(id);
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    product.stock = stock;
    return await this.productRepository.updateProduct(id, product);
  }
}