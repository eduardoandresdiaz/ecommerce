import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from '../dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findProductsByKeywords(keywords: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { name: keywords }, // ajustá según tu lógica de búsqueda
    });
  }

  async getProducts(page: number, limit: number): Promise<Product[]> {
    return await this.productRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },   // ✅ último publicado primero
    });
  }
  

  async getProductsByCreatorEmail(creatorEmail: string): Promise<Product[]> {
    return await this.productRepository.find({ where: { creatorEmail } });
  }

  async getProductById(id: string): Promise<Product> {
    return await this.productRepository.findOne({ where: { id } });
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...dto,
      mostrarprecio: dto.mostrarprecio ?? true,
      resaltaroferta: dto.resaltaroferta ?? false,
      nopublicable: dto.nopublicable ?? false,

      proveedor: dto.proveedor ?? null,
      createdAt: new Date(),
      expiresAt: dto.expiresAt ?? null,
    });
    return await this.productRepository.save(product);
  }

  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product> {
    await this.productRepository.update(id, updateData);
    return await this.getProductById(id);
  }

  async deleteProduct(id: string): Promise<Partial<Product>> {
    const product = await this.getProductById(id);
    await this.productRepository.delete(id);
    return { id: product.id, name: product.name };
  }

  async addProducts(): Promise<string> {
    // tu lógica de seeding
    return 'Productos agregados';
  }

  async updateStock(id: string, stock: number): Promise<Product> {
    const product = await this.getProductById(id);
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    product.stock = stock;
    return await this.productRepository.save(product);
  }
}
