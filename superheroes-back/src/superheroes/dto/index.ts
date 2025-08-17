/**
 * Archivo index para exportar todos los DTOs
 * 
 * Esto permite importar múltiples DTOs de manera más limpia:
 * import { CreateSuperheroDto, UpdateSuperheroDto } from './dto';
 * 
 * En lugar de:
 * import { CreateSuperheroDto } from './dto/create-superhero.dto';
 * import { UpdateSuperheroDto } from './dto/update-superhero.dto';
 */

export { CreateSuperheroDto } from './create-superhero.dto';
export { UpdateSuperheroDto } from './update-superhero.dto';
export { SuperheroResponseDto } from './superhero-response.dto';