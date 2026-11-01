import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductRequestDto {
  @IsString({ message: 'El proveedor debe ser un texto.' })
  @IsNotEmpty({ message: 'Debes seleccionar un proveedor.' })
  @MaxLength(100, {
    message: 'El nombre del proveedor no puede superar los 100 caracteres.',
  })
  supplierName: string;

  @IsString({ message: 'El detalle del producto debe ser un texto.' })
  @IsNotEmpty({ message: 'El detalle del producto es obligatorio.' })
  productDetail: string;

  @Type(() => Number)
  @IsInt({ message: 'El stock actual debe ser un número entero.' })
  @Min(0, {
    message: 'El stock actual no puede ser menor que cero.',
  })
  currentStock: number;

  @Type(() => Number)
  @IsInt({ message: 'La cantidad a pedir debe ser un número entero.' })
  @Min(1, {
    message: 'La cantidad a pedir debe ser mayor que cero.',
  })
  requestedQuantity: number;
}