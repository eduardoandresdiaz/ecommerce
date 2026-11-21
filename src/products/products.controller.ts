import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Res,
  Req,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { AuthGuard } from '../guards/auth.guard';
import { validateProduct } from '../utils/validate';
import { Roles } from '../decorators/roles/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enum/roles.enum';
import { Response } from 'express';
import { Request } from 'express';
import {
  getProductShareImageUrl,
  getProductIdFromShareKey,
  getProductShareUrl,
} from '../utils/product-share-link';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    merchantOwnerEmail?: string;
  };
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  private getMerchantEmail(request: AuthenticatedRequest): string {
    const email = request.user?.merchantOwnerEmail ?? request.user?.email;
    if (!email) {
      throw new UnauthorizedException('No se pudo identificar al comercio.');
    }
    return email;
  }

  private async assertProductBelongsToMerchant(
    request: AuthenticatedRequest,
    productId: string,
  ): Promise<string> {
    const merchantEmail = this.getMerchantEmail(request);
    const product = await this.productsService.getProductById(productId);
    if (product.creatorEmail.toLowerCase() !== merchantEmail.toLowerCase()) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este producto.',
      );
    }
    return merchantEmail;
  }

  @Get('search')
  async findProductsByKeywords(@Query('q') q: string): Promise<Product[]> {
    return await this.productsService.findProductsByKeywords(q);
  }
  // ⭐ Nuevo endpoint PATCH para actualizar stock
  @HttpCode(200)
  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { stock: number },
    @Req() request: AuthenticatedRequest,
  ) {
    if (typeof body.stock !== 'number' || body.stock < 0) {
      throw new HttpException('Stock inválido', HttpStatus.BAD_REQUEST);
    }
    await this.assertProductBelongsToMerchant(request, id);
    return await this.productsService.updateStock(id, body.stock);
  }
  @HttpCode(200)
  @Get()
  getProducts(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('category') category?: string,
  ) {
    if (page && limit) {
      return this.productsService.getProducts(
        Number(page),
        Number(limit),
        category,
      );
    }

    return this.productsService.getProducts(
      1,
      5,
      category,
    );
  }
  // @HttpCode(200)
  // @Get()
  // getProducts(@Query('page') page: number, @Query('limit') limit: number) {
  //   if (page && limit) {
  //     return this.productsService.getProducts(page, limit);
  //   }
  //   return this.productsService.getProducts(1, 5);
  // }

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

  /*
   * Sitemap dinámico con todos los productos publicables.
   * GET /products/sitemap.xml
   */
  @Get('sitemap.xml')
  async getSitemap(@Res() res: Response) {
    const sitemap =
      await this.productsService.generateSitemap();

    res.setHeader(
      'Content-Type',
      'application/xml; charset=utf-8',
    );

    res.setHeader(
      'Cache-Control',
      'public, max-age=3600',
    );

    return res.status(HttpStatus.OK).send(sitemap);
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
  @UseGuards(AuthGuard)
  async createProduct(
    @Body() newProduct: Product,
    @Req() request: AuthenticatedRequest,
  ): Promise<string> {
    if (validateProduct(newProduct)) {
      newProduct.creatorEmail = this.getMerchantEmail(request);
      newProduct.telefono = newProduct.telefono || null;
      newProduct.telefono = newProduct.telefono || null;

      // ✅ Inicialización de campos adicionales
      newProduct.mostrarprecio = newProduct.mostrarprecio ?? true;
      newProduct.resaltaroferta = newProduct.resaltaroferta ?? false;
      newProduct.nopublicable = newProduct.nopublicable ?? false;
      newProduct.proveedor = newProduct.proveedor || null;
      // 🔹 Nuevos campos
      newProduct.stockminimo = newProduct.stockminimo ?? 0;
      newProduct.ubicacion = newProduct.ubicacion || null;
      newProduct.fechaCaducidad = newProduct.fechaCaducidad ?? null;

      return await this.productsService.createProduct(newProduct);

    }
    throw new HttpException('Producto inválido', HttpStatus.BAD_REQUEST);
  }

  @HttpCode(200)
  @Put(':id')
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<Product>,
    @Req() request: AuthenticatedRequest,
  ) {
    if (validateProduct(updateData)) {
      await this.assertProductBelongsToMerchant(request, id);
      const safeUpdateData = { ...updateData };
      delete safeUpdateData.creatorEmail;
      return await this.productsService.updateProduct(id, safeUpdateData);
    }
    throw new HttpException(
      'Datos del producto inválidos',
      HttpStatus.BAD_REQUEST,
    );
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.assertProductBelongsToMerchant(request, id);
    return await this.productsService.deleteProduct(id);
  }

  /////////////////// ⭐ AGREGADO CORRECTO
  @Get('creator/:email')
  async getProductsByCreator(@Param('email') email: string) {
    return await this.productsService.getProductsByCreatorEmail(email);
  }

  @Get('count/:email')
  async getProductCount(@Param('email') email: string) {
    const products = await this.productsService.getProductsByCreatorEmail(email);
    return { count: products.length };
  }
  /////////////////// FIN AGREGADO

  @Get('share/:id')
  async shareProduct(@Param('id') shareKey: string, @Res() res: Response) {
    const id = getProductIdFromShareKey(shareKey);
    if (!id) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Identificador de producto inválido');
    }

    const product = await this.productsService.getProductById(id);
    if (!product) {
      return res.status(HttpStatus.NOT_FOUND).send('Producto no encontrado');
    }
    const productUrl = getProductShareUrl(product.name, id);
    const realProductUrl = `https://conlara.com.ar/productos/${id}`;
    const imageUrl = getProductShareImageUrl(product.imgUrl);

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
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:image:secure_url" content="${imageUrl}" />
        <meta property="og:image:alt" content="${product.name}" />
        <meta property="og:url" content="${productUrl}" />
        <meta property="og:site_name" content="Conlara Tienda" />
        <meta property="fb:app_id" content="1010635721174127" />

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

  @Get('share-facebook/:id')
  async compartirProductoFacebook(
    @Param('id') shareKey: string,
    @Res() res: Response,
  ) {
    const id = getProductIdFromShareKey(shareKey);
    if (!id) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Identificador de producto inválido');
    }

    try {
      const producto = await this.productsService.getProductById(id);

      if (!producto) {
        return res.status(404).send('<h1>Producto no encontrado</h1>');
      }

      const nombre = producto.name?.replace(/"/g, '&quot;') || 'Producto';
      const descripcion =
        producto.description?.replace(/"/g, '&quot;') || '¡Mirá este producto!';
      const imagen = getProductShareImageUrl(producto.imgUrl);
      const destinoFinal = `https://conlara.com.ar/productos/${producto.id}`;
      const shareUrl = getProductShareUrl(producto.name, producto.id);

      const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${nombre} - Conlara Tienda</title>
        <meta name="description" content="${descripcion}" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content="${nombre}" />
        <meta property="og:description" content="${descripcion}" />
        <meta property="og:image" content="${imagen}" />
        <meta property="og:image:secure_url" content="${imagen}" />
        <meta property="og:image:alt" content="${nombre}" />
        <meta property="og:url" content="${shareUrl}" />
        <meta property="og:site_name" content="Conlara Tienda" />
        <meta property="fb:app_id" content="1010635721174127" />
      </head>
      <body>
        <h1>Redirigiendo al producto...</h1>
        <p>Si no redirige automáticamente, <a href="${destinoFinal}">haz clic aquí</a>.</p>
        <script>
          setTimeout(() => {
            window.location.href = "${destinoFinal}";
          }, 1500);
        </script>
      </body>
      </html>
      `;

      res.send(html);
    } catch (error) {
      console.error('Error en compartirProductoFacebook:', error);
      res.status(500).send('<h1>Error al cargar el producto</h1>');
    }
  }
}
