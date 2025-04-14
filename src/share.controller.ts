import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import fetch from 'node-fetch'; // Asegurate de tener instalado `node-fetch`

@Controller('productos/share')
export class ShareController {
  @Get(':id')
  async proxyHtml(@Param('id') id: string, @Res() res: Response) {
    try {
      const response = await fetch(
        `https://ecommerce-9558.onrender.com/products/share/${id}`,
      );
      const html = await response.text();
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      console.error('Error al obtener HTML remoto:', err);
      res.status(500).send('Error al obtener el HTML del producto.');
    }
  }
}
