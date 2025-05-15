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
  }
  //////////////////////////////////
  @Get('share/:nickname')
  async compartirPerfil(
    @Param('nickname') nickname: string,
    @Res() res: Response,
  ) {
    try {
      // Obtener datos del usuario
      const userRes = await fetch(
        `https://ecommerce-9558.onrender.com/users/nickname/${nickname}`,
      );
      if (!userRes.ok) {
        return res.status(404).send('<h1>Usuario no encontrado</h1>');
      }
      const usuario = await userRes.json();

      const productosRes = await fetch(
        `https://ecommerce-9558.onrender.com/products/by-creator?creatorEmail=${usuario.email}`,
      );
      const productos = productosRes.ok ? await productosRes.json() : [];
      const nicknameFormatted = nickname.replace(/_/g, ' ');
      console.log(usuario.imgUrlUser);
      const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>${nicknameFormatted}</title>
    <meta name="description" content="Mira los productos publicados por ${nicknameFormatted}" />

    <!-- Meta etiquetas Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${nicknameFormatted}" />
    <meta property="og:description" content="Mira los productos publicados por ${nicknameFormatted}" />
    <meta property="og:image" content="${usuario.imgUrlUser}" />
    <meta property="og:url" content="https://conlara.com.ar/users/share/${nickname}" />
    <meta property="fb:app_id" content="1010635721174127" />

    <style>
      body { font-family: Arial, sans-serif; text-align: center; background-color: #ffae3b; padding: 20px; }
      .perfilPublico__imagen img { max-width: 300px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
      .listadoProductos { display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; margin-top: 20px; }
      .producto { padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fff84f; max-width: 300px; text-align: center; }
      .producto img { max-width: 100%; border-radius: 5px; }
      .producto h3 { font-size: 1.2rem; color: #333; }
      .producto p { font-size: 1rem; color: #666; }
      .botonInteresa { background-color: #007BFF; color: white; padding: 10px 15px; border-radius: 5px; font-size: 1rem; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 10px; }
      .botonInteresa:hover { background-color: #0056b3; }
    </style>
  </head>
  <body>
    <h1> ${nicknameFormatted}</h1>
    <div class="perfilPublico__imagen">
      <img src="${usuario.imgUrlUser}" alt="Foto de ${nicknameFormatted}" />
    </div>

    <h2>Productos de ${nicknameFormatted}</h2>
    <div class="listadoProductos">
      ${productos
        .map(
          (producto) => `
        <div class="producto">
          <img src="${producto.imgUrl}" alt="${producto.name}" style="max-width: 100%;" />
          <h3>${producto.name}</h3>
          <p>Precio: ${isNaN(producto.price) || producto.price === 1 ? 'Consultar' : `$${parseFloat(producto.price).toFixed(2)}`}</p>
          <a href="https://conlara.com.ar/productos/${producto.id}" class="botonInteresa">Me Interesa</a>
        </div>
      `,
        )
        .join('')}
    </div>
  </body>
  </html>
`;

      res.send(html);
    } catch (error) {
      console.error('Error en compartirPerfil:', error);
      res.status(500).send('<h1>Error al obtener los datos</h1>');
    }
  }

  //   @Get('share/:nickname')
  //   async compartirPerfil(
  //     @Param('nickname') nickname: string,
  //     @Res() res: Response,
  //   ) {
  //     try {
  //       const userRes = await fetch(
  //         `https://ecommerce-9558.onrender.com/users/nickname/${nickname}`,
  //       );
  //       if (!userRes.ok) {
  //         return res.status(404).send('<h1>Usuario no encontrado</h1>');
  //       }
  //       const usuario = await userRes.json();

  //       const productosRes = await fetch(
  //         `https://ecommerce-9558.onrender.com/products/by-creator?creatorEmail=${usuario.email}`,
  //       );
  //       const productos = productosRes.ok ? await productosRes.json() : [];
  //       const nicknameFormatted = nickname.replace(/_/g, ' ');
  //       console.log(usuario.imgUrlUser);
  //       const html = `
  //   <!DOCTYPE html>
  //   <html lang="es">
  //   <head>
  //     <meta charset="UTF-8">
  //     <title>${nicknameFormatted}</title>
  //     <meta name="description" content="Mira los productos publicados por ${nicknameFormatted}" />

  //     <!-- Meta etiquetas Open Graph -->
  //     <meta property="og:type" content="website" />
  //     <meta property="og:title" content="Perfil de usuario: ${nicknameFormatted}" />
  //     <meta property="og:description" content="Mira los productos publicados por ${nicknameFormatted}" />
  //     <meta property="og:image" content="${usuario.imgUrlUser}" />
  //     <meta property="og:url" content="https://conlara.com.ar/users/share/${nickname}" />
  //     <meta property="fb:app_id" content="1010635721174127" />

  //     <style>
  //       body { font-family: Arial, sans-serif; text-align: center; background-color: #ffae3b; padding: 20px; }
  //       .perfilPublico__imagen img { max-width: 300px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
  //       .listadoProductos { display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; margin-top: 20px; }
  //       .producto { padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fff84f; max-width: 300px; text-align: center; }
  //       .producto img { max-width: 100%; border-radius: 5px; }
  //       .producto h3 { font-size: 1.2rem; color: #333; }
  //       .producto p { font-size: 1rem; color: #666; }
  //       .botonInteresa { background-color: #007BFF; color: white; padding: 10px 15px; border-radius: 5px; font-size: 1rem; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 10px; }
  //       .botonInteresa:hover { background-color: #0056b3; }
  //     </style>
  //   </head>
  //   <body>
  //     <h1>Perfil de ${nicknameFormatted}</h1>
  //     <div class="perfilPublico__imagen">
  //       <img src="${usuario.imgUrlUser}" alt="Foto de ${nicknameFormatted}" />
  //     </div>

  //     <h2>Productos de ${nicknameFormatted}</h2>
  //     <div class="listadoProductos">
  //       ${productos
  //         .map(
  //           (producto) => `
  //         <div class="producto">
  //           <img src="${producto.imgUrl}" alt="${producto.name}" style="max-width: 100%;" />
  //           <h3>${producto.name}</h3>
  //           <p>Precio: ${isNaN(producto.price) || producto.price === 1 ? 'Consultar' : `$${parseFloat(producto.price).toFixed(2)}`}</p>
  //           <a href="https://conlara.com.ar/productos/${producto.id}" class="botonInteresa">Me Interesa</a>
  //         </div>
  //       `,
  //         )
  //         .join('')}
  //     </div>
  //   </body>
  //   </html>
  // `;

  //       res.send(html);
  //     } catch (error) {
  //       console.error('Error en compartirPerfil:', error);
  //       res.status(500).send('<h1>Error al obtener los datos</h1>');
  //     }
  //   }

  //////////////////////////////////

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
