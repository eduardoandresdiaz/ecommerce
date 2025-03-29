import {
  IsString,
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsStrongPassword,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50) // Validación adicional para evitar nombres demasiado largos o cortos
  name?: string;

  @IsOptional()
  @IsPhoneNumber('AR', {
    message: 'El teléfono debe ser un número válido para Argentina',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50) // Limitar longitud máxima para el país
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100) // Validación adicional para direcciones largas
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50) // Limitar longitud máxima para la ciudad
  city?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  @IsStrongPassword(
    {
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: 'La contraseña debe ser segura y cumplir con los requisitos' },
  )
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(15) // Validación adicional para el DNI
  dni?: string; // Nuevo campo para el DNI
}
