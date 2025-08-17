/**
 * Archivo index del módulo Superheroes
 * 
 * Facilita las importaciones permitiendo usar:
 * import { SuperheroModule, SuperheroService, CreateSuperheroDto } from './superheroes';
 * 
 * En lugar de múltiples imports:
 * import { SuperheroModule } from './superheroes/superhero.module';
 * import { SuperheroService } from './superheroes/services/superhero.service';
 * import { CreateSuperheroDto } from './superheroes/dto/create-superhero.dto';
 */

// Exportar el módulo principal
export { SuperheroModule } from './superhero.module';

// Exportar entidades
export { Superhero } from './entities/superhero.entity';

// Exportar servicios
export { SuperheroService } from './services/superhero.service';

// Exportar controladores
export { SuperheroController } from './controllers/superhero.controller';

// Exportar todos los DTOs
export * from './dto';