import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

export class UserRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getUsers(page: number = 1, limit: number = 100): Promise<User[]> {
    const startIndex = (page - 1) * limit;
    return this.usersRepository.find({
      skip: startIndex,
      take: limit,
    });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { orders: true },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByDni(dni: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { dni } });
  }

  async findEmployees(ownerId: string): Promise<Partial<User>[]> {
    return this.usersRepository.find({
      where: {
        merchantOwnerId: ownerId,
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        dni: true,
        email: true,
        isActive: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findEmployee(
    ownerId: string,
    employeeId: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        id: employeeId,
        merchantOwnerId: ownerId,
      },
    });
  }

  async createEmployeeForOwner(
    ownerId: string,
    employeeData: Partial<User>,
  ): Promise<Partial<User>> {
    return this.usersRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(User);
      const owner = await repository.findOne({
        where: { id: ownerId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!owner) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (owner.merchantOwnerId || owner.isAdmin || !owner.isActive) {
        throw new ForbiddenException(
          'Solo el dueño activo del comercio puede administrar empleados.',
        );
      }

      const activeEmployees = await repository.count({
        where: {
          merchantOwnerId: ownerId,
          isActive: true,
        },
      });
      if (activeEmployees >= 2) {
        throw new BadRequestException(
          'El comercio ya tiene el máximo de 2 empleados activos.',
        );
      }

      const employee = await repository.save(employeeData);
      const { password, isAdmin, ...safeEmployee } = employee;
      return safeEmployee;
    });
  }

  async createUser(
    user: Partial<Omit<User, 'id'>>,
  ): Promise<Omit<User, 'password' | 'isAdmin'>> {
    const newUser = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, isAdmin, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // async createUser(
  //   user: Omit<User, 'id'>,
  // ): Promise<Omit<User, 'password' | 'isAdmin'>> {
  //   const newUser = await this.usersRepository.save(user);
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { password, isAdmin, ...userWithoutPassword } = newUser;
  //   return userWithoutPassword;
  // }

  async updateUser(
    id: string,
    user: Partial<User>,
  ): Promise<Omit<User, 'password'>> {
    await this.usersRepository.update(id, user);
    const updatedUser = await this.getUserById(id);
    if (!updatedUser) throw new NotFoundException('Usuario no encontrado');

    // Eliminar la propiedad `password` pero mantener `isAdmin`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.getUserById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.usersRepository.remove(user);

    // Eliminar la propiedad `password` pero mantener `isAdmin`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async getUserByNickname(
    nickname: string,
  ): Promise<Omit<User, 'password' | 'isAdmin'>> {
    const user = await this.usersRepository.findOne({ where: { nickname } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado con ese nickname');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, isAdmin, ...userWithoutSensitiveData } = user; // Excluye datos sensibles
    return userWithoutSensitiveData;
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}