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
  Res,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { AuthGuard } from '../guards/auth.guard';
import { validateProduct } from '../utils/validate';
import { Roles } from '../decorators/roles/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enum/roles.enum';
import { Response } from 'express';

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
      product.telefono = 'Teléfono no disponible';
    }
    return product;
  }

  @HttpCode(200)
  @Post()
  async createProduct(@Body() newProduct: Product): Promise<string> {
    if (validateProduct(newProduct)) {
      newProduct.telefono = newProduct.telefono || null;
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

  // Único método para compartir el producto
  // Asegúrate de que solo haya un método shareProduct
  @Get('share/:id')
  async shareProduct(@Param('id') id: string, @Res() res: Response) {
    const product = await this.productsService.getProductById(id);
    if (!product) {
      return res.status(HttpStatus.NOT_FOUND).send('Producto no encontrado');
    }

    const productUrl = `https://conlara.com.ar/productos/share/${id}`;
    const realProductUrl = `https://ecommerce-9558.onrender.com/products/share/${id}`;

    const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${product.name} - Conlara Tienda</title>
        <meta name="description" content="${product.description}" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content="${product.name}" />
        <meta property="og:description" content="${product.description}" />
        <meta property="og:image" content="${product.imgUrl}" />
        <meta property="og:url" content="${productUrl}" />
        <meta property="og:site_name" content="Conlara Tienda" />
        <meta property="fb:app_id" content="TU_FB_APP_ID" />
        
        <meta http-equiv="refresh" content="3; url=${realProductUrl}" />
      </head>
      <body>
        <script>
          window.location.href = "${realProductUrl}";
        </script>
      </body>
    </html>
  `;

    res.status(HttpStatus.OK).send(html);
  }
}

// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   HttpCode,
//   Param,
//   ParseUUIDPipe,
//   Post,
//   Put,
//   Query,
//   UseGuards,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { ProductsService } from './products.service';
// import { Product } from './products.entity';
// import { AuthGuard } from '../guards/auth.guard';
// import { validateProduct } from '../utils/validate';
// import { Roles } from '../decorators/roles/roles.decorator';
// import { RolesGuard } from '../guards/roles.guard';
// import { Role } from '../enum/roles.enum';

// @Controller('products')
// export class ProductsController {
//   constructor(private readonly productsService: ProductsService) {}

//   @Get('search')
//   async findProductsByKeywords(@Query('q') q: string): Promise<Product[]> {
//     return await this.productsService.findProductsByKeywords(q);
//   }

//   @HttpCode(200)
//   @Get()
//   getProducts(@Query('page') page: number, @Query('limit') limit: number) {
//     if (page && limit) {
//       return this.productsService.getProducts(page, limit);
//     }
//     return this.productsService.getProducts(1, 5);
//   }

//   @HttpCode(200)
//   @Get('seeders')
//   addproducts() {
//     return this.productsService.addProducts();
//   }

//   @HttpCode(200)
//   @Get('by-creator')
//   getProductsByCreatorEmail(@Query('creatorEmail') creatorEmail: string) {
//     if (!creatorEmail) {
//       throw new HttpException(
//         'Debe proporcionar el correo del creador',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//     return this.productsService.getProductsByCreatorEmail(creatorEmail);
//   }

//   @HttpCode(200)
//   @Get(':id')
//   async getProductById(@Param('id', ParseUUIDPipe) id: string) {
//     const product = await this.productsService.getProductById(id);
//     if (!product.telefono) {
//       product.telefono = 'Teléfono no disponible'; // Valor predeterminado
//     }
//     return product;
//   }

//   @HttpCode(200)
//   @Post()
//   async createProduct(@Body() newProduct: Product): Promise<string> {
//     if (validateProduct(newProduct)) {
//       newProduct.telefono = newProduct.telefono || null; // Asignar el teléfono si es proporcionado
//       return await this.productsService.createProduct(newProduct);
//     }
//     throw new HttpException('Producto inválido', HttpStatus.BAD_REQUEST);
//   }

//   @HttpCode(200)
//   @Put(':id')
//   @Roles(Role.ADMIN)
//   @UseGuards(AuthGuard, RolesGuard)
//   async updateProduct(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() updateData: Partial<Product>,
//   ) {
//     if (validateProduct(updateData)) {
//       return await this.productsService.updateProduct(id, updateData);
//     }
//     throw new HttpException(
//       'Datos del producto inválidos',
//       HttpStatus.BAD_REQUEST,
//     );
//   }

//   @HttpCode(200)
//   @Delete(':id')
//   @UseGuards(AuthGuard)
//   async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
//     return await this.productsService.deleteProduct(id);
//   }
// }
