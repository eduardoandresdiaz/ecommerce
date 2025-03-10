import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    console.log('Authorization Header:', authHeader); // Log del encabezado de autorización

    if (!authHeader) {
      throw new UnauthorizedException('No autorizado');
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token); // Log del token

    if (!token) {
      throw new UnauthorizedException('No autorizado');
    }

    try {
      const secret = process.env.JWT_SECRET;
      const user = this.jwtService.verify(token, { secret });

      console.log('User Payload:', user); // Log del payload del token

      user.exp = new Date(user.exp * 1000);
      user.iat = new Date(user.iat * 1000);

      // Asignar roles basado en isadmin
      if (user.isadmin) {
        user.roles = ['admin']; // Asignar rol admin
      } else {
        user.roles = ['user']; // Asignar rol user
      }

      request.user = user;

      console.log('User:', request.user); // Log del usuario final con roles asignados

      return true; // Si la autenticación es válida, permite el acceso
    } catch (error) {
      console.error('Token validation error:', error); // Log del error de validación del token
      throw new UnauthorizedException('No autorizado');
    }
  }
}

// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';
// import { Observable } from 'rxjs';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private readonly jwtService: JwtService) {}

//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest<Request>();
//     const authHeader = request.headers.authorization;

//     console.log('Authorization Header:', authHeader); // Log del encabezado de autorización

//     if (!authHeader) {
//       throw new UnauthorizedException('No autorizado');
//     }

//     const token = authHeader.split(' ')[1];
//     console.log('Token:', token); // Log del token

//     if (!token) {
//       throw new UnauthorizedException('No autorizado');
//     }

//     try {
//       const secret = process.env.JWT_SECRET;
//       const user = this.jwtService.verify(token, { secret });

//       console.log('User Payload:', user); // Log del payload del token

//       user.exp = new Date(user.exp * 1000);
//       user.iat = new Date(user.iat * 1000);

//       if (user.isAdmin) {
//         user.roles = ['admin'];
//       } else {
//         user.roles = ['user'];
//       }
//       request.user = user;

//       return true; // Si la autenticación es válida, permite el acceso
//     } catch (error) {
//       console.error('Token validation error:', error); // Log del error de validación del token
//       throw new UnauthorizedException('No autorizado');
//     }
//   }
// }

// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { request } from 'http';
// import { Observable } from 'rxjs';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private readonly jwtService: JwtService) {}

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private readonly jwtService: JwtService) {}
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = request.headers.authorization.split(' ')[1];
//     if (!token) {
//       throw new UnauthorizedException('No autorizado');
//     }
//     try {
//       const secret = process.env.JWT_SECRET;
//       const user = this.jwtService.verify(token, { secret });
//       user.exp = new Date(user.exp * 1000);
//       user.iat = new Date(user.iat * 1000);
//       request.user = user;
//       return true;
//     }catch {throw new UnauthorizedException('No autorizado');

//     }

//   }

// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private readonly jwtService: JwtService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const authHeader = request.headers['authorization'];

//     console.log('Authorization Header:', authHeader); // Log del encabezado de autorización

//     if (!authHeader) {
//       throw new UnauthorizedException('No autorizado');
//     }

//     const [type, token] = authHeader.split(' ');

//     console.log('Token Type:', type); // Log del tipo de token
//     console.log('Token:', token); // Log del token

//     if (type !== 'Bearer' || !token) {
//       throw new UnauthorizedException('Credenciales incorrectas');
//     }

//     try {
//       const payload = await this.jwtService.verifyAsync(token, {
//         secret: process.env.JWT_SECRET,
//       });

//       request.user = payload; // Establecer el usuario en la solicitud
//       console.log('Payload:', payload); // Log del payload del token
//     } catch (error) {
//       console.error('Token validation error:', error); // Log del error de validación del token
//       throw new UnauthorizedException('Token inválido o expirado');
//     }

//     return true; // Si la autenticación es válida, permite el acceso
//   }
// }
