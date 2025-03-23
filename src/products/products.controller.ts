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

  @HttpCode(200)
  @Get()
  getProducts(@Query('page') page: number, @Query('limit') limit: number) {
    console.log('entro aca');
    if (page && limit) {
      return this.productsService.getProducts(page, limit);
    }
    return this.productsService.getProducts(1, 5);
  }

  @Get('seeders')
  addproducts() {
    console.log('entro al controller del seeders');
    return this.productsService.addProducts();
  }

  @HttpCode(200)
  @Get(':id')
  getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getProductById(id);
  }

  @HttpCode(200)
  @Post()
  async createProduct(@Body() newProduct: Product): Promise<string> {
    try {
      // Validar el producto y manejar fechas
      if (validateProduct(newProduct)) {
        newProduct.createdAt = new Date(); // Fecha de creación
        const expirationDate = new Date();
        expirationDate.setDate(newProduct.createdAt.getDate() + 15); // 15 días después
        newProduct.expiresAt = expirationDate;

        const result = await this.productsService.createProduct(newProduct);
        return result;
      } else {
        throw new HttpException('Producto inválido', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Error desconocido al crear producto',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  @HttpCode(200)
  @Put(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  updateProduct(
    @Query('id', ParseUUIDPipe) id: string,
    @Body() updateProduct: Product,
  ) {
    if (validateProduct(updateProduct)) {
      return this.productsService.updateProduct(id, updateProduct);
    } else {
      return 'producto no valido';
    }
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    console.log('produto controller delete');
    return this.productsService.deleteProduct(id);
  }
}
