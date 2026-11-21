import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReassignProductRequestDto {
  @IsString({ message: 'El proveedor debe ser un texto.' })
  @IsNotEmpty({ message: 'Debes seleccionar un proveedor.' })
  @MaxLength(100, {
    message: 'El nombre del proveedor no puede superar los 100 caracteres.',
  })
  supplierName: string;
}
