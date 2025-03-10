import { loginUserDto } from 'src/dto/login.user.dto';
import { AuthService } from './auth.service';
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  signIn(@Body() Credentials: loginUserDto) {
    const { email, password } = Credentials;
    return this.authService.signIn(email, password);
  }
  @Post('signup')
  signup(@Body() user: CreateUserDto) {
    console.log('entro a signup en controller ');
    return this.authService.signUp(user);
  }
}
