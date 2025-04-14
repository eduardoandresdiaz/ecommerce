import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { fetch } from 'undici';

@Controller('productos/share')
export class ShareController {
  @Get(':id')
  async proxyHtml(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Solicitud al proxy recibida con ID: ${id}`);

      const response = await fetch(
        `https://ecommerce-9558.onrender.com/products/share/${id}`,
        {
          method: 'GET',
          headers: { Accept: 'text/html' },
          timeout: 5000,
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('X-Proxy-Server', 'NestJS Proxy');
      res.send(html);
    } catch (err) {
      console.error('Error al obtener HTML remoto:', err);
      res
        .status(500)
        .send(`Error al obtener el HTML del producto: ${err.message}`);
    }
  }
}
