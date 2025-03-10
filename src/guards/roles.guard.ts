import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/roles.enum'; // Asegúrate de que la ruta sea correcta

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User:', user);
    console.log('Required Roles:', requiredRoles);

    if (!requiredRoles) {
      return true; // No se requieren roles específicos, permitir acceso
    }

    const hasRole = () =>
      requiredRoles.some((role) => user?.roles?.includes(role));
    const valid = user && user.roles && hasRole();

    if (!valid) {
      throw new ForbiddenException('No autorizado');
    }

    return valid;
  }
}

// Exporta la clase RolesGuard

// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Role } from '../enum/roles.enum'; // Asegúrate de que la ruta sea correcta

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;

//     console.log('User:', user);
//     console.log('Required Roles:', requiredRoles);

//     if (!requiredRoles) {
//       return true; // No se requieren roles específicos, permitir acceso
//     }

//     const hasRole = () =>
//       requiredRoles.some((role) => user?.roles?.includes(role));
//     const valid = user && user.roles && hasRole();

//     if (!valid) {
//       throw new ForbiddenException('No autorizado');
//     }

//     return valid;
//   }
// }

// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Role } from '../enum/roles.enum';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}
//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;
//     console.log('User:', user);
//     console.log('Required Roles:', requiredRoles);
//     const hasRole = () =>
//       requiredRoles.some((role) => user?.roles?.includes(role));
//     const valid = user && user.roles && hasRole();
//     if (!valid) {
//       throw new ForbiddenException('No autorizado');
//     }
//     return valid;
//   }
// }
