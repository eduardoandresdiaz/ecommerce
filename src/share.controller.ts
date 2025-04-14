import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { fetch } from 'undici';

@Controller('productos/share')
export class ShareController {
  @Get(':id')
  async proxyHtml(@Param('id') id: string, @Res() res: Response) {
    try {
      const response = await fetch(
        `https://ecommerce-9558.onrender.com/products/share/${id}`,
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
