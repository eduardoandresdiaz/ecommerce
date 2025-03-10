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
import { AuthGuard } from 'src/guards/auth.guard';
import { validateProduct } from 'src/utils/validate';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from 'src/enum/roles.enum';

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
  //@UseGuards(AuthGuard)
  async createProduct(@Body() newProduct: Product): Promise<string> {
    if (validateProduct(newProduct)) {
      try {
        const result = await this.productsService.createProduct(newProduct);
        return result;
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
    } else {
      throw new HttpException('Producto invalido', HttpStatus.BAD_REQUEST);
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
