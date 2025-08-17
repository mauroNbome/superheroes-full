import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsUrl, Min, Max, IsArray, ArrayNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO para crear un nuevo superhéroe
 * 
 * Los DTOs (Data Transfer Objects) definen la estructura de datos
 * que se espera recibir en las peticiones HTTP
 * 
 * class-validator proporciona decoradores para validación:
 * @IsString() - Debe ser string
 * @IsNotEmpty() - No puede estar vacío
 * @IsOptional() - Campo opcional
 * @IsInt() - Debe ser entero
 * @Min() / @Max() - Valores mínimo y máximo
 * 
 * class-transformer permite transformar datos:
 * @Transform() - Transforma el valor
 * @Type() - Convierte tipos
 */
export class CreateSuperheroDto {
  /**
   * Nombre real del superhéroe
   * Obligatorio, debe ser string no vacío
   */
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  /**
   * Alias del superhéroe
   * Obligatorio, único en la base de datos
   */
  @IsString({ message: 'El alias debe ser un texto' })
  @IsNotEmpty({ message: 'El alias es obligatorio' })
  alias: string;

  /**
   * Lista de superpoderes
   * Puede venir como array o string separado por comas
   */
  @IsArray({ message: 'Los poderes deben ser una lista' })
  @ArrayNotEmpty({ message: 'Debe tener al menos un poder' })
  @IsString({ each: true, message: 'Cada poder debe ser un texto' })
  @Transform(({ value }) => {
    // Si viene como string, lo convertimos a array
    if (typeof value === 'string') {
      return value.split(',').map(power => power.trim()).filter(power => power.length > 0);
    }
    return value;
  })
  powers: string[];

  /**
   * Ciudad donde opera
   * Obligatorio
   */
  @IsString({ message: 'La ciudad debe ser un texto' })
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city: string;

  /**
   * Descripción del superhéroe
   * Opcional
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;

  /**
   * URL de la imagen
   * Opcional, debe ser URL válida si se proporciona
   */
  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  imageUrl?: string;

  /**
   * Nivel de poder (1-10)
   * Obligatorio, debe estar entre 1 y 10
   */
  @IsInt({ message: 'El nivel de poder debe ser un número entero' })
  @Min(1, { message: 'El nivel de poder debe ser mínimo 1' })
  @Max(10, { message: 'El nivel de poder debe ser máximo 10' })
  @Type(() => Number) // Convierte string a number
  powerLevel: number;

  /**
   * Estado activo/inactivo
   * Opcional, por defecto true
   */
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser true o false' })
  @Transform(({ value }) => {
    // Convertir string "true"/"false" a boolean
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isActive?: boolean = true;
}