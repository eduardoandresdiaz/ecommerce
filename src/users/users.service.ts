import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  getUsers(page: number, limit: number) {
    return this.userRepository.getUsers(page, limit);
  }
  async getUserByNickname(
    nickname: string,
  ): Promise<Omit<User, 'password' | 'isAdmin'>> {
    return this.userRepository.getUserByNickname(nickname);
  }

  getUserById(id: string) {
    return this.userRepository.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado con el correo especificado',
      );
    }
    return user;
  }

  createUser(
    user: Omit<User, 'id'>,
  ): Promise<Omit<User, 'password' | 'isAdmin'>> {
    return this.userRepository.createUser(user);
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
