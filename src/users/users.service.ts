import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './users.repository';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDto } from '../dto/create-employee.dto';

export type UserProfile = Omit<User, 'password'> & {
  merchantOwnerEmail: string;
  merchantOwnerNickname: string;
  merchantOwnerSharedcount: number;
};

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUsers(page: number, limit: number): Promise<Partial<User>[]> {
    const users = await this.userRepository.getUsers(page, limit);
    return users.map(({ password, ...user }) => user);
  }
  async getUserByNickname(
    nickname: string,
  ): Promise<Omit<User, 'password' | 'isAdmin'>> {
    return this.userRepository.getUserByNickname(nickname);
  }

  async getUserById(id: string): Promise<Omit<User, 'password'>> {
    const { password, ...user } = await this.userRepository.getUserById(id);
    return user;
  }

  async getUserByEmail(email: string): Promise<UserProfile> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado con el correo especificado',
      );
    }

    const merchantOwner = user.merchantOwnerId
      ? await this.userRepository.getUserById(user.merchantOwnerId)
      : user;
    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      proveedores: merchantOwner.proveedores,
      merchantOwnerEmail: merchantOwner.email,
      merchantOwnerNickname: merchantOwner.nickname,
      merchantOwnerSharedcount: merchantOwner.sharedcount,
    };
  }

  async getEmployees(ownerId: string): Promise<Partial<User>[]> {
    await this.assertMerchantOwner(ownerId);
    return this.userRepository.findEmployees(ownerId);
  }

  async createEmployee(
    ownerId: string,
    employeeData: CreateEmployeeDto,
  ): Promise<Partial<User>> {
    const owner = await this.assertMerchantOwner(ownerId);

    if (employeeData.password !== employeeData.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    const email = employeeData.email.trim().toLowerCase();
    const dni = employeeData.dni.trim();

    if (await this.userRepository.findByEmail(email)) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    if (await this.userRepository.findByDni(dni)) {
      throw new ConflictException('Ya existe una cuenta con ese DNI.');
    }

    const password = await bcrypt.hash(employeeData.password, 10);
    return this.userRepository.createEmployeeForOwner(ownerId, {
      name: employeeData.name.trim(),
      nickname: employeeData.nickname.trim(),
      dni,
      email,
      password,
      merchantOwnerId: owner.id,
      isActive: true,
      isAdmin: false,
      address: null,
      phone: null,
      country: null,
      city: null,
      proveedores: [],
    });
  }

  async deactivateEmployee(
    ownerId: string,
    employeeId: string,
  ): Promise<{ message: string }> {
    await this.assertMerchantOwner(ownerId);

    const employee = await this.userRepository.findEmployee(
      ownerId,
      employeeId,
    );

    if (!employee) {
      throw new NotFoundException(
        'No se encontró ese empleado en tu comercio.',
      );
    }

    employee.isActive = false;
    await this.userRepository.save(employee);

    return {
      message: 'Empleado desactivado correctamente.',
    };
  }

  private async assertMerchantOwner(ownerId: string): Promise<User> {
    const owner = await this.userRepository.getUserById(ownerId);

    if (owner.merchantOwnerId || owner.isAdmin || !owner.isActive) {
      throw new ForbiddenException(
        'Solo el dueño del comercio puede administrar empleados.',
      );
    }

    return owner;
  }

  // createUser(
  //   user: Omit<User, 'id'>,
  // ): Promise<Omit<User, 'password' | 'isAdmin'>> {
  //   return this.userRepository.createUser(user);
  // }
  async createUser(
    user: Omit<User, 'id'>,
  ): Promise<Omit<User, 'password' | 'isAdmin'>> {
    try {
      return await this.userRepository.createUser(user);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error; // opcional: relanzas el error para que se maneje en otro nivel
    }
  }
  

  // async updateUser(
  //   id: string,
  //   updateUserDto: Partial<User>,
  // ): Promise<Omit<User, 'password'>> {
  //   const user = await this.userRepository.getUserById(id);

  //   for (const key in updateUserDto) {
  //     if (Object.prototype.hasOwnProperty.call(updateUserDto, key)) {
  //       user[key] = updateUserDto[key];
  //     }
  //   }

  //   const updatedUser = await this.userRepository.save(user);
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { password, ...userWithoutPassword } = updatedUser;
  //   return userWithoutPassword;
  // }
  

async updateUser(
  id: string,
  updateUserDto: Partial<User>,
): Promise<Omit<User, 'password'>> {
  const user = await this.userRepository.getUserById(id);

  for (const key in updateUserDto) {
    if (Object.prototype.hasOwnProperty.call(updateUserDto, key)) {
      if (['id', 'isAdmin', 'isActive', 'merchantOwnerId'].includes(key)) {
        continue;
      }

      if (key === 'password' && updateUserDto.password) {
        // 🔒 Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(updateUserDto.password, salt);
      } else {
        user[key] = updateUserDto[key];
      }
    }
  }

  const updatedUser = await this.userRepository.save(user);
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}


  deleteUser(id: string) {
    return this.userRepository.deleteUser(id);
  }
  async getProductosByUsuario(email: string) {
    const response = await fetch(
      `https://ecommerce-9558.onrender.com/products/by-creator?creatorEmail=${email}`,
    );
    return response.json();
  }
}

// import { Injectable } from '@nestjs/common';
// import { UserRepository } from './users.repository';
// import { User } from './user.entity';
// import { UpdateUserDto } from '../dto/update-user.dto';

// @Injectable()
// export class UserService {
//   constructor(private userRepository: UserRepository) {}

//   getUsers(page: number, limit: number) {
//     return this.userRepository.getUsers(page, limit);
//   }

//   getUserById(id: string) {
//     return this.userRepository.getUserById(id);
//   }

//   createUser(
//     user: Omit<User, 'id'>,
//   ): Promise<Omit<User, 'password' | 'isAdmin'>> {
//     return this.userRepository.createUser(user);
//   }

//   async updateUser(
//     id: string,
//     updateUserDto: UpdateUserDto,
//   ): Promise<Omit<User, 'password'>> {
//     const user = await this.userRepository.getUserById(id);

//     for (const key in updateUserDto) {
//       if (Object.prototype.hasOwnProperty.call(updateUserDto, key)) {
//         user[key] = updateUserDto[key];
//       }
//     }

//     const updatedUser = await this.userRepository.save(user);
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const { password, ...userWithoutPassword } = updatedUser;
//     return userWithoutPassword;
//   }

//   deleteUser(id: string) {
//     return this.userRepository.deleteUser(id);
//   }
// }
