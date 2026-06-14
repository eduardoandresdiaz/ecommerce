import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Laptop Gamer' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Descripción del producto', example: 'Laptop con RTX 4060' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Precio del producto', example: 1500 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Stock disponible', example: 10 })
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @ApiProperty({ description: 'URL de la imagen', example: 'https://res.cloudinary.com/...jpg' })
  @IsOptional()
  @IsString()
  imgUrl?: string;

  @ApiProperty({ description: 'Email del creador', example: 'vendedor@example.com' })
  @IsNotEmpty()
  @IsString()
  creatorEmail: string;

  @ApiProperty({ description: 'Teléfono del vendedor', example: '+5491134567890' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ description: 'Fecha de expiración del producto', example: '2026-12-31' })
  @IsOptional()
  expiresAt?: Date;

  @ApiProperty({ description: 'Mostrar precio en la UI', example: true })
  @IsOptional()
  @IsBoolean()
  mostrarPrecio?: boolean;

  @ApiProperty({ description: 'Resaltar como oferta', example: false })
  @IsOptional()
  @IsBoolean()
  resaltarOferta?: boolean;

  @ApiProperty({ description: 'Indica si no es publicable', example: false })
  @IsOptional()
  @IsBoolean()
  noPublicable?: boolean;

  @ApiProperty({ description: 'Proveedor del producto', example: 'Proveedor X' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  proveedor?: string;
}
