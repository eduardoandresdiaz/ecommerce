import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

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

  async createUser(
    user: Omit<User, 'id'>,
  ): Promise<Omit<User, 'password' | 'isAdmin'>> {
    const newUser = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, isAdmin, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

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

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
