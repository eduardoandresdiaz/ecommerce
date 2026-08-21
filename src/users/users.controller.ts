import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    return this.userService.getUsers(page, limit);
  }

  @HttpCode(200)
  @Get('nickname/:nickname')
  getUserByNickname(@Param('nickname') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }@Get('share/:nickname')
  async compartirPerfil(
    @Param('nickname') nickname: string,
    @Res() res: Response,
  ) {
    try {
      // Obtener datos del usuario
      const userRes = await fetch(
        `https://ecommerce-9558.onrender.com/users/nickname/${encodeURIComponent(
          nickname,
        )}`,
      );
  
      if (!userRes.ok) {
        return res.status(404).type('html').send('<h1>Usuario no encontrado</h1>');
      }
  
      const usuario = await userRes.json();
  
      // Obtener productos del creador
      const productosRes = await fetch(
        `https://ecommerce-9558.onrender.com/products/by-creator?creatorEmail=${encodeURIComponent(
          usuario.email,
        )}`,
      );
      const productos = productosRes.ok ? await productosRes.json() : [];
  
      const nicknameFormatted = nickname.replace(/_/g, ' ');
  
      const html = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>${nicknameFormatted}</title>
    <meta name="description" content="Mira los productos publicados por ${nicknameFormatted}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${nicknameFormatted}" />
    <meta property="og:description" content="Mira los productos publicados por ${nicknameFormatted}" />
    <meta property="og:image" content="${usuario.imgUrlUser || ''}" />
    <meta property="og:url" content="https://conlara.com.ar/users/share/${encodeURIComponent(
      nickname,
    )}" />
    <meta property="fb:app_id" content="1010635721174127" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* =========================
         BASE LAYOUT Y COLORES
         ========================= */
      :root{
        --primario: #0d9488;
        --acento:   #ff7a18;
        --fondo:    #fffdf6;
        --card-bg:  #f7fff9;
        --texto:    #0f1720;
        --muted:    #6b7280;
      }
  
      html,body{height:100%;margin:0;padding:0;font-family: Arial, sans-serif;background:var(--fondo);color:var(--texto);}
  
      /* =========================
         LISTADO DE PRODUCTOS (adaptado)
         ========================= */
      .listadoProductos {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1px;
        min-height: 100vh;
        box-sizing: border-box;
      }
  
      .listadoProductos__buscador {
        position: fixed;
        top: 43px;
        left: 0;
        width: 100%;
        z-index: 1000;
        display: flex;
        justify-content: center;
        padding: 8px 12px;
        background: transparent;
        border: none;
      }
  
      .listadoProductos__buscador input,
      .listadoProductos__buscador button {
        padding: 8px;
        font-size: 16px;
      }
  
      .listadoProductos__buscador button {
        background: var(--primario);
        color: #fff;
        border: none;
        cursor: pointer;
        border-radius: 6px;
      }
      .listadoProductos__buscador button:hover { background: #0b7f78; }
  
      .listadoProductos__list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 18px;
        max-width: 1200px;
      }
  
      .listadoProductos__details,
      .producto {
        border: 4px solid rgba(13,148,136,0.12);
        background: var(--card-bg);
        border-radius: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin: 0;
        padding: 10px;
        gap: 8px;
        width: 100%;
        min-height: 300px;
        font-size: 14px;
        box-shadow: 0 6px 18px rgba(15,23,32,0.06);
        position: relative;
        cursor: pointer;
      }
  
      .producto img,
      .listadoProductos__details img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid rgba(0,0,0,0.06);
        margin: 0;
      }
  
      .producto h3,
      .listadoProductos__details h2 {
        font-size: 14px;
        margin: 0 0 6px;
        padding: 0 8px;
        line-height: 1.3;
        text-align: justify;
        text-justify: inter-word;
        white-space: normal;
        overflow-wrap: break-word;
        word-break: break-word;
        max-width: 35ch;
        color: var(--texto);
      }
  
      .price {
        font-weight: 800;
        font-size: 16px;
        margin-top: auto;
        color: var(--primario);
        padding: 6px 8px;
        background: rgba(13,148,136,0.06);
        border-radius: 6px;
      }
  
      .botonInteresa,
      .meInteresaBoton {
        background: linear-gradient(90deg, var(--primario), #0b8f86);
        color: #fff;
        border: none;
        cursor: pointer;
        border-radius: 8px;
        padding: 8px 12px;
        margin: 8px 0 12px 0;
        text-decoration: none;
        display: inline-block;
        font-weight: 700;
        transition: transform .12s ease, box-shadow .12s ease;
        box-shadow: 0 6px 14px rgba(13,148,136,0.12);
      }
      .botonInteresa:hover,
      .meInteresaBoton:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(13,148,136,0.14); }
  
      .ofertaOverlay {
        position: absolute; top: 12px; left: 12px;
        background: var(--acento); color: #fff; font-weight: bold;
        padding: 6px 10px; border-radius: 6px;
        border: 2px solid rgba(0,0,0,0.08); z-index: 2;
        box-shadow: 0 6px 14px rgba(255,122,24,0.12);
      }
  
      .precioTexto { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: var(--texto); margin: 0; padding: 6px; }
  
      @media (max-width: 480px) {
        .producto, .listadoProductos__details {
          background-color: var(--primario);
          width: 100%;
          max-width: 46%;
          margin-bottom: auto;
          padding: 0;
          color: #fff;
        }
        .producto h3, .listadoProductos__details h2 { color: #fff; }
        .price { color: #fff; background: rgba(255,255,255,0.08); }
      }
  
      @media (max-width: 767px) {
        .listadoProductos__list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px !important;
          width: 100%;
          padding: 8px;
          margin-bottom: auto;
        }
        .producto { max-width: 100%; flex: 1 1 48%; }
      }
  
      @media (min-width: 768px) {
        .listadoProductos__list {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }
        .producto { flex: 1 1 30%; max-width: 30%; min-height: 320px; }
      }
  
      /* =========================
         MENU APPOINTMENT / QR STYLES (aplicados)
         ========================= */
      .menu-appointment {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 11em;
        background-color: #e3f2df;
        font-family: 'Arial', sans-serif;
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 18px;
        border-radius: 8px;
        padding: 12px;
      }
  
      .menu-appointment__content { text-align: center; padding-top: 12px; }
  
      .menu-appointment__title { font-size: 2rem; color: #333; margin-bottom: 12px; }
  
      .menu-appointment__buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
        justify-content: center;
        align-items: center;
      }
  
      .menu-appointment__button {
        padding: 10px;
        font-size: 1rem;
        color: #fff;
        background-color: #007bff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s ease, transform .08s ease;
        width: 200px;
        text-decoration: none;
        display: inline-block;
        text-align: center;
      }
      .menu-appointment__button:hover { background-color: #0056b3; transform: translateY(-2px); }
      .menu-appointment__button:focus { outline: none; }
  
      .menu-appointment__button.disabled {
        background-color: #ccc;
        color: #666;
        cursor: not-allowed;
        border: 1px solid #aaa;
      }
  
      .qr-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        gap: 8px;
      }
  
      .qr-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 5px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        width: 80%;
      }
  
      .print-button {
        margin-top: 10px;
        padding: 8px 12px;
        font-size: 14px;
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 6px;
      }
      .print-button:hover { background-color: #0056b3; }
  
      .menu-appointment__qr {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 15px;
        text-align: center;
        width: 100%;
      }
  
      .qr-link { margin-top: 10px; font-size: 16px; font-weight: bold; text-align: center; }
      .qr-link a { color: #007bff; text-decoration: none; }
      .qr-link a:hover { text-decoration: underline; }
  
      /* Impresión: mostrar solo QR y link */
      @media print {
        body * { visibility: hidden; }
        .menu-appointment__qr, .menu-appointment__qr * { visibility: visible; text-align: center; }
        .qr-link { margin-top: 10px; font-size: 16px; font-weight: bold; }
        .qr-link a { color: black; text-decoration: none; }
        .print-button { display: none; }
  
        .menu-appointment__qr canvas { width: 600px !important; height: 600px !important; }
        .qr-link { font-size: 18px; text-align: center; }
        .menu-appointment__qr::before {
          content: "Escanea el QR para ver nuestros productos";
          display: block;
          font-size: 26px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 15px;
        }
      }
    </style>
  </head>
  <body>
    <div class="listadoProductos">
      <div style="height:56px;"></div> <!-- espacio para el buscador fijo -->
      
  
      <header style="text-align:center; margin: 12px 0;">
        <h1 style="margin:0; color: var(--primario);">${nicknameFormatted}</h1>
      </header>
  
      <div style="display:flex; justify-content:center; margin-bottom:12px;">
        <div class="perfilPublico__imagen">
          <img src="${usuario.imgUrlUser || 'https://via.placeholder.com/300'}" alt="Foto de ${nicknameFormatted}" style="border-radius:8px; max-width:300px;" />
        </div>
      </div>
  
      <!-- Menu appointment / QR arriba del listado -->
      
  
      <h2 style="margin: 6px 0 0 0; text-align:center; color: var(--muted);">Productos de ${nicknameFormatted}</h2>
  
      <div class="listadoProductos__list" role="list">
        ${productos
          .map((producto: any) => {
            const mostrarprecio = producto.mostrarprecio !== undefined ? producto.mostrarprecio : true;
            const expiresAt = producto.expiresAt ?? producto.expires_at ?? null;
            const priceText = (() => {
              if (mostrarprecio === false) return 'Consultar';
              if (expiresAt) {
                const exp = new Date(expiresAt);
                if (!isNaN(exp.getTime()) && exp < new Date()) return 'Consultar';
              }
              const validPrice = isNaN(Number(producto.price)) ? 0 : parseFloat(String(producto.price));
              return validPrice === 1 ? 'Consultar' : `$${validPrice.toFixed(2)}`;
            })();
  
            const productId = producto.id ?? producto._id ?? '';
            const productUrl = `https://conlara.com.ar/productos/${encodeURIComponent(productId)}`;
            const img = producto.imgUrl || 'https://via.placeholder.com/300';
            const name = producto.name || 'Producto';
  
            return `
          <article class="producto" role="listitem" data-href="${productUrl}">
            ${producto.oferta ? '<div class="ofertaOverlay">OFERTA</div>' : ''}
            <img src="${img}" alt="${name}" />
            <h3 title="${name}">${name}</h3>
            <div class="precioTexto price">Precio: ${priceText}</div>
            <a href="${productUrl}" class="botonInteresa">Me Interesa</a>
          </article>
        `;
          })
          .join('')}
      </div>
    </div>
  
    <script>
      // Redirección al hacer click en la tarjeta (evita doble navegación si se clickea el enlace)
      document.querySelectorAll(".producto, .listadoProductos__details").forEach(card => {
        card.addEventListener("click", (e) => {
          const target = e.target;
          if (target && (target.tagName === 'A' || target.closest('a'))) return;
          const href = card.getAttribute("data-href");
          if (href) window.location.href = href;
        });
      });
  
      // Generar QR en el cliente si existe canvas (opcional, simple fallback)
      (function renderQR() {
        try {
          const canvas = document.getElementById('qr-canvas');
          if (!canvas) return;
          const url = 'https://conlara.com.ar/users/share/${encodeURIComponent(nickname)}';
          // Si el navegador tiene API de canvas y no hay librería, dibujamos un placeholder simple
          const ctx = canvas.getContext && canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = 200;
          canvas.height = 200;
          // placeholder visual (no es un QR real). Si querés QR real, genera con librería en frontend.
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.fillStyle = '#000000';
          ctx.fillRect(20,20,40,40);
          ctx.fillRect(140,20,40,40);
          ctx.fillRect(20,140,40,40);
          ctx.fillStyle = '#0d9488';
          ctx.fillRect(80,80,40,40);
        } catch (err) {
          // no bloquear si falla
          console.warn('QR render fallback failed', err);
        }
      })();
    </script>
  </body>
  </html>
  `;
  
      res.status(200).type('html').send(html);
    } catch (error) {
      console.error('Error en compartirPerfil:', error);
      res.status(500).type('html').send('<h1>Error al obtener los datos</h1>');
    }
  }
  

  @HttpCode(200)
  @Get(':id')
  @UseGuards(AuthGuard)
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUserById(id);
  }

  @HttpCode(200)
  @Get('email/:email')
  @UseGuards(AuthGuard)
  getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }

  @HttpCode(200)
  @Put(':id')
  @UseGuards(AuthGuard)
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(String(id), updateUserDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    console.log('users controller delete');
    return this.userService.deleteUser(id);
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
//   Put,
//   Query,
//   UseGuards,
// } from '@nestjs/common';
// import { UserService } from './users.service';
// import { UpdateUserDto } from '../dto/update-user.dto';
// import { AuthGuard } from '../guards/auth.guard';
// import { RolesGuard } from '../guards/roles.guard';
// import { Roles } from '../decorators/roles/roles.decorator';
// import { Role } from '../enum/roles.enum';
// import { ApiBearerAuth } from '@nestjs/swagger';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly userService: UserService) {}
//   @ApiBearerAuth()
//   @Get()
//   @Roles(Role.ADMIN)
//   @UseGuards(AuthGuard, RolesGuard)
//   getUsers(@Query('page') page: number, @Query('limit') limit: number) {
//     return this.userService.getUsers(page, limit);
//   }

//   @HttpCode(200)
//   @Get(':id')
//   @UseGuards(AuthGuard)
//   getUserById(@Param('id', ParseUUIDPipe) id: string) {
//     return this.userService.getUserById(id);
//   }

//   @HttpCode(200)
//   @Put(':id')
//   //@UseGuards(AuthGuard)
//   updateUser(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() updateUserDto: UpdateUserDto,
//   ) {
//     return this.userService.updateUser(String(id), updateUserDto);
//   }

//   @HttpCode(200)
//   @Delete(':id')
//   //@UseGuards(AuthGuard)
//   deleteUser(@Param('id', ParseUUIDPipe) id: string) {
//     console.log('users controller delete');
//     return this.userService.deleteUser(id);
//   }
// }
