import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { fetch } from 'undici';
import {
  getProductIdFromShareKey,
  getProductShareUrl,
} from './utils/product-share-link';
import { ProductsService } from './products/products.service';

@Controller('productos/share')
export class ShareController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':shareKey')
  async proxyHtml(
    @Param('shareKey') shareKey: string,
    @Res() res: Response,
  ) {
    const id = getProductIdFromShareKey(shareKey);
    if (!id) {
      return res
        .status(400)
        .send('Identificador de producto inválido');
    }

    if (shareKey === id) {
      const product = await this.productsService.getProductById(id);
      return res.redirect(
        HttpStatus.MOVED_PERMANENTLY,
        getProductShareUrl(product.name, id),
      );
    }

    try {
      const response = await fetch(
        `https://ecommerce-9558.onrender.com/products/share/${encodeURIComponent(id)}`,
      );

      const html = await response.text();

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(response.status).send(html);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message ?? 'Error desconocido';
      console.error('Error al obtener HTML remoto:', errorMessage);
      return res
        .status(500)
        .send(`Error al obtener el HTML del producto: ${errorMessage}`);
    }
  }
}
