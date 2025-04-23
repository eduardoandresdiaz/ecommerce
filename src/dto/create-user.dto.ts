import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    required: true,
    description: 'Nombre del usuario',
    example: 'Eduardo Diaz',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name: string;

  @ApiProperty({
    required: true,
    description: 'Apodo del usuario',
    example: 'Eddie',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nickname: string; // Nuevo campo agregado

  @ApiProperty({
    required: true,
    description: 'Correo electrónico del usuario',
    example: 'eduardoandresdiaz@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
    description:
      'La contraseña debe tener al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo, y tener entre 8 y 15 caracteres',
    example: 'Edudiaz1234$',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  @IsStrongPassword({
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({
    required: true,
    description: 'Confirmación de la contraseña del usuario',
    example: 'Edudiaz1234$',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  confirmPassword: string;

  @ApiProperty({
    required: true,
    description: 'Teléfono del usuario',
    example: '+5491134567890',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    required: true,
    description: 'País del usuario',
    example: 'Argentina',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  country: string;

  @ApiProperty({
    required: true,
    description: 'Dirección del usuario',
    example: 'Calle Falsa 123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  address: string;

  @ApiProperty({
    required: true,
    description: 'Ciudad del usuario',
    example: 'Buenos Aires',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  city: string;

  @ApiProperty({
    required: true,
    description: 'DNI del usuario',
    example: '12345678',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @MaxLength(15)
  dni: string;

  @ApiProperty({
    required: false,
    description:
      'Define si el usuario es administrador (automáticamente vacío)',
    example: false,
  })
  @IsEmpty()
  isAdmin?: boolean;

  @ApiProperty({
    required: false,
    description: 'URL de la imagen del usuario',
    example:
      'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1745373239/sinfoto_rxnp9w.jpg',
  })
  @IsString()
  imgUrlUser?: string; // Nuevo campo agregado

  @ApiProperty({
    required: false,
    description: 'Órdenes asociadas al usuario',
    example: [],
  })
  orders: any[];
}
