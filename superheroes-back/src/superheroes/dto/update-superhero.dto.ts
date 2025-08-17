import { PartialType } from '@nestjs/mapped-types';
import { CreateSuperheroDto } from './create-superhero.dto';

/**
 * DTO para actualizar un superhéroe existente
 * 
 * PartialType() es una utilidad de NestJS que toma un DTO base
 * y hace que todas sus propiedades sean opcionales
 * 
 * Esto significa que UpdateSuperheroDto tendrá las mismas
 * validaciones que CreateSuperheroDto, pero todos los campos
 * serán opcionales, permitiendo actualizaciones parciales
 */
export class UpdateSuperheroDto extends PartialType(CreateSuperheroDto) {
  // PartialType automáticamente hace que todas las propiedades de 
  // CreateSuperheroDto sean opcionales y mantenga sus validaciones
}

/**
 * Ejemplo de uso:
 * 
 * Para actualizar solo el nivel de poder:
 * {
 *   "powerLevel": 8
 * }
 * 
 * Para actualizar nombre y ciudad:
 * {
 *   "name": "Clark Kent",
 *   "city": "Metropolis"
 * }
 * 
 * Todas las validaciones del CreateSuperheroDto se aplican,
 * pero solo para los campos que se proporcionen
 */