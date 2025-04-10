import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { AuthGuard } from '../guards/auth.guard';
import { validateProduct } from '../utils/validate';
import { Roles } from '../decorators/roles/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enum/roles.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('search')
  async findProductsByKeywords(@Query('q') q: string): Promise<Product[]> {
    return await this.productsService.findProductsByKeywords(q);
  }

  @HttpCode(200)
  @Get()
  getProducts(@Query('page') page: number, @Query('limit') limit: number) {
    if (page && limit) {
      return this.productsService.getProducts(page, limit);
    }
    return this.productsService.getProducts(1, 5);
  }

  @HttpCode(200)
  @Get('seeders')
  addproducts() {
    return this.productsService.addProducts();
  }

  @HttpCode(200)
  @Get('by-creator')
  getProductsByCreatorEmail(@Query('creatorEmail') creatorEmail: string) {
    if (!creatorEmail) {
      throw new HttpException(
        'Debe proporcionar el correo del creador',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.productsService.getProductsByCreatorEmail(creatorEmail);
  }

  @HttpCode(200)
  @Get(':id')
  async getProductById(@Param('id', ParseUUIDPipe) id: string) {
    const product = await this.productsService.getProductById(id);
    if (!product.telefono) {
      product.telefono = 'Teléfono no disponible'; // Valor predeterminado
    }
    return product;
  }

  @HttpCode(200)
  @Post()
  async createProduct(@Body() newProduct: Product): Promise<string> {
    if (validateProduct(newProduct)) {
      newProduct.telefono = newProduct.telefono || null; // Asignar el teléfono si es proporcionado
      return await this.productsService.createProduct(newProduct);
    }
    throw new HttpException('Producto inválido', HttpStatus.BAD_REQUEST);
  }

  @HttpCode(200)
  @Put(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<Product>,
  ) {
    if (validateProduct(updateData)) {
      return await this.productsService.updateProduct(id, updateData);
    }
    throw new HttpException(
      'Datos del producto inválidos',
      HttpStatus.BAD_REQUEST,
    );
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productsService.deleteProduct(id);
  }
}
