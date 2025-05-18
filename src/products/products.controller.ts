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
  ///////////////////prueba
  @Get('share/:id')
  async shareProduct(@Param('id') id: string, @Res() res: Response) {
    const product = await this.productsService.getProductById(id);
    if (!product) {
      return res.status(HttpStatus.NOT_FOUND).send('Producto no encontrado');
    }

    const realProductUrl = `https://conlara.com.ar/productos/${product.id}`;
    const productUrl = `https://conlara.com.ar/productos/share/${product.id}`;

    const precioFormateado =
      !product.price || Number(product.price) === 1
        ? 'Consultar precio'
        : `$${Number(product.price).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;

    const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${product.name} - Conlara.com.ar</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${product.description}" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content="${product.name}" />
        <meta property="og:description" content="${product.description}" />
        <meta property="og:image" content="${product.imgUrl}" />
        <meta property="og:url" content="${productUrl}" />
        <meta property="og:site_name" content="Conlara.com.ar" />
        <meta property="fb:app_id" content="1010635721174127" />
        <meta http-equiv="refresh" content="5; url=${realProductUrl}" />
  
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #fff9c4;
            margin: 0;
            padding: 0;
          }
          .encabezado {
            text-align: center;
            padding: 20px;
          }
          .encabezado h1 {
            font-size: 2.5rem;
            color: #222;
            margin: 0;
          }
          .encabezado h2 {
            font-size: 1.5rem;
            color: #444;
            margin: 0;
          }
          .contenedor {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background: #fce40c;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .titulo {
            font-size: 1.8rem;
            margin-bottom: 10px;
            color: #333;
          }
          .descripcion, .precio {
            font-size: 1.2rem;
            color: #555;
            margin: 10px 0;
          }
          .imagen {
            max-width: 100%;
            border-radius: 8px;
            margin-top: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          .redireccion {
            margin-top: 30px;
            font-size: 1rem;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="encabezado">
          <h1>CONLARA.COM.AR</h1>
          <h2>Compra y Vende en el Valle del Conlara</h2>
        </div>
  
        <div class="contenedor">
          <h1 class="titulo">${product.name}</h1>
          <p class="descripcion"><strong>Descripción:</strong> ${product.description}</p>
          <p class="precio"><strong>Precio:</strong> ${precioFormateado}</p>
          <img class="imagen" src="${product.imgUrl}" alt="${product.name}" />
          
          <p class="redireccion">Serás redirigido en 5 segundos... Si no, <a href="${realProductUrl}">hacé clic acá</a>.</p>
        </div>
  
        <script>
          setTimeout(() => {
            window.location.href = "${realProductUrl}";
          }, 5000);
        </script>
      </body>
    </html>
    `;

    res.status(HttpStatus.OK).send(html);
  }
}
/////////////////////fin prueba

// Único método para compartir el producto
// Asegúrate de que solo haya un método shareProduct
//   @Get('share/:id')
//   async shareProduct(@Param('id') id: string, @Res() res: Response) {
//     const product = await this.productsService.getProductById(id);
//     if (!product) {
//       return res.status(HttpStatus.NOT_FOUND).send('Producto no encontrado');
//     }
//     const productUrl = `https://ecommerce-9558.onrender.com/products/share/${id}`;
//     //const productUrl = `https://conlara.com.ar/productos/share/${id}`;
//     const realProductUrl = `https://conlara.com.ar/productos/${id}`;

//     const html = `
//     <!DOCTYPE html>
//     <html lang="es">
//       <head>
//         <meta charset="utf-8" />
//         <title>${product.name} - Conlara Tienda</title>
//         <meta name="description" content="${product.description}" />
//         <meta property="og:type" content="product" />
//         <meta property="og:title" content="${product.name}" />
//         <meta property="og:description" content="${product.description}" />
//         <meta property="og:image" content="${product.imgUrl}" />
//         <meta property="og:url" content="${productUrl}" />
//         <meta property="og:site_name" content="Conlara Tienda" />
//         <meta property="fb:app_id" content="1010635721174127" />

//         <meta http-equiv="refresh" content="3; url=${realProductUrl}" />
//       </head>
//       <body>
//         <script>
//           window.location.href = "${realProductUrl}";
//         </script>
//       </body>
//     </html>
//   `;

//     res.status(HttpStatus.OK).send(html);
//   }
// }

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
