import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UserRepository } from 'src/users/users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    const isPasswordMach = await bcrypt.compare(password, user.password);
    console.log(user.password);
    console.log(isPasswordMach);
    if (!user || !isPasswordMach) {
      throw new BadRequestException('credenciales invalidas');
    }
    const userPayload = {
      id: user.id,
      email: user.email,
      isadmin: user.isAdmin,
    };
    const token = this.jwtService.sign(userPayload);
    return { token, message: 'bienvenido' };
  }

  async signUp(user: CreateUserDto) {
    console.log('entro a signUp en service ');
    const foundUser = await this.userRepository.findByEmail(user.email);
    if (foundUser) {
      throw new BadRequestException('el usuario ya registrado');
    }
    if (user.password !== user.confirmPassword) {
      throw new BadRequestException('las Contraseñas o Email no coinciden');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    if (!hashedPassword) {
      throw new BadRequestException('error al hashear clave');
    }
    await this.userRepository.createUser({
      ...user,
      password: hashedPassword,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, confirmPassword, ...userWithoutPass } = user;

    return userWithoutPass;
  }
}
