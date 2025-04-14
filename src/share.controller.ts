import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { fetch } from 'undici'; // 👈 cambiamos node-fetch por undici

@Controller('productos/share')
export class ShareController {
  @Get(':id')
  async proxyHtml(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Solicitud al proxy recibida con ID: ${id}`);

      const response = await fetch(
        `https://ecommerce-9558.onrender.com/products/share/${id}`,
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // 🔥 Solución CORS: Añadir los encabezados correctos
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      res.setHeader('Content-Type', 'text/html');

      res.send(html);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message ?? 'Error desconocido';
      console.error('Error al obtener HTML remoto:', errorMessage);
      res
        .status(500)
        .send(`Error al obtener el HTML del producto: ${errorMessage}`);
    }
  }
}
