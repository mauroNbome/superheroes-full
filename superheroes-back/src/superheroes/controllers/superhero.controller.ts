import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { SuperheroService } from '../services/superhero.service';
import { CreateSuperheroDto, UpdateSuperheroDto, SuperheroResponseDto } from '../dto';

/**
 * SuperheroController - Controlador para manejar endpoints de superhéroes
 * 
 * @Controller('superheroes') define el prefijo de ruta para todos los endpoints
 * Todas las rutas de este controlador comenzarán con /superheroes
 * 
 * Endpoints disponibles:
 * GET    /superheroes          - Obtener todos los superhéroes
 * GET    /superheroes/stats    - Obtener estadísticas
 * GET    /superheroes/search   - Buscar por alias
 * GET    /superheroes/:id      - Obtener un superhéroe por ID
 * POST   /superheroes          - Crear un nuevo superhéroe
 * PATCH  /superheroes/:id      - Actualizar un superhéroe
 * DELETE /superheroes/:id      - Eliminar un superhéroe (físicamente)
 */
@Controller('superheroes')
export class SuperheroController {
  /**
   * Constructor con inyección del servicio
   * 
   * @param superheroService - Servicio que contiene la lógica de negocio
   */
  constructor(private readonly superheroService: SuperheroService) {}

  /**
   * Crear un nuevo superhéroe
   * 
   * POST /superheroes
   * 
   * @param createSuperheroDto - Datos del superhéroe desde el body
   * @returns SuperheroResponseDto - Superhéroe creado
   * 
   * Ejemplo de uso:
   * POST /superheroes
   * {
   *   "name": "Clark Kent",
   *   "alias": "Superman",
   *   "powers": ["Vuelo", "Fuerza sobrehumana", "Visión de rayos X"],
   *   "city": "Metropolis",
   *   "powerLevel": 10
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED) // Devuelve código 201 (Created)
  async create(@Body() createSuperheroDto: CreateSuperheroDto): Promise<SuperheroResponseDto> {
    return this.superheroService.create(createSuperheroDto);
  }

  /**
   * Obtener todos los superhéroes con filtros opcionales
   * 
   * GET /superheroes?name=superman&city=metropolis&isActive=true&powerLevel=10&limit=10&offset=0
   * 
   * @param name - Filtro por nombre (opcional)
   * @param city - Filtro por ciudad (opcional)
   * @param isActive - Filtro por estado activo (opcional)
   * @param powerLevel - Filtro por nivel de poder (opcional)
   * @param limit - Número máximo de resultados (opcional)
   * @param offset - Número de resultados a saltar (opcional)
   * @returns { data: SuperheroResponseDto[], total: number }
   * 
   * Ejemplos de uso:
   * GET /superheroes                                    - Todos los superhéroes
   * GET /superheroes?city=Gotham                       - Superhéroes de Gotham
   * GET /superheroes?isActive=true&powerLevel=10       - Superhéroes activos nivel 10
   * GET /superheroes?limit=5&offset=10                 - Paginación (página 3, 5 por página)
   */
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('city') city?: string,
    @Query('isActive') isActive?: string,
    @Query('powerLevel') powerLevel?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ data: SuperheroResponseDto[]; total: number; pagination: any }> {
    
    // Validar y convertir parámetros de query
    const filters: any = {};
    
    if (name) filters.name = name;
    if (city) filters.city = city;
    
    // Convertir string a boolean para isActive
    if (isActive !== undefined) {
      if (isActive === 'true') filters.isActive = true;
      else if (isActive === 'false') filters.isActive = false;
      else throw new BadRequestException('isActive debe ser "true" o "false"');
    }
    
    // Convertir y validar powerLevel
    if (powerLevel) {
      const level = parseInt(powerLevel);
      if (isNaN(level) || level < 1 || level > 10) {
        throw new BadRequestException('powerLevel debe ser un número entre 1 y 10');
      }
      filters.powerLevel = level;
    }
    
    // Convertir y validar limit
    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('limit debe ser un número entre 1 y 100');
      }
      filters.limit = limitNum;
    }
    
    // Convertir y validar offset
    if (offset) {
      const offsetNum = parseInt(offset);
      if (isNaN(offsetNum) || offsetNum < 0) {
        throw new BadRequestException('offset debe ser un número mayor o igual a 0');
      }
      filters.offset = offsetNum;
    }

    const result = await this.superheroService.findAll(filters);
    
    // Agregar información de paginación
    const pagination = {
      limit: filters.limit || result.total,
      offset: filters.offset || 0,
      total: result.total,
      hasNext: (filters.offset || 0) + (filters.limit || result.total) < result.total,
      hasPrev: (filters.offset || 0) > 0,
    };

    return {
      ...result,
      pagination,
    };
  }

  /**
   * Obtener estadísticas de superhéroes
   * 
   * GET /superheroes/stats
   * 
   * @returns Estadísticas generales de superhéroes
   * 
   * Respuesta incluye:
   * - Total de superhéroes
   * - Superhéroes activos e inactivos
   * - Distribución por nivel de poder
   * - Top ciudades con más superhéroes
   */
  @Get('stats')
  async getStats() {
    return this.superheroService.getStats();
  }

  /**
   * Buscar superhéroes por alias
   * 
   * GET /superheroes/search?alias=super
   * 
   * @param alias - Alias a buscar (búsqueda parcial)
   * @returns SuperheroResponseDto[] - Superhéroes que coinciden
   * 
   * Ejemplo:
   * GET /superheroes/search?alias=man
   * Podría devolver: Superman, Batman, Spider-Man, etc.
   */
  @Get('search')
  async search(@Query('alias') alias: string): Promise<SuperheroResponseDto[]> {
    if (!alias) {
      throw new BadRequestException('El parámetro "alias" es obligatorio');
    }
    return this.superheroService.findByAlias(alias);
  }

  /**
   * Obtener un superhéroe por ID
   * 
   * GET /superheroes/:id
   * 
   * @param id - ID del superhéroe
   * @returns SuperheroResponseDto - Superhéroe encontrado
   * 
   * ParseIntPipe valida que el parámetro sea un número entero
   * 
   * Ejemplo:
   * GET /superheroes/1
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuperheroResponseDto> {
    return this.superheroService.findOne(id);
  }

  /**
   * Actualizar un superhéroe existente
   * 
   * PATCH /superheroes/:id
   * 
   * @param id - ID del superhéroe a actualizar
   * @param updateSuperheroDto - Datos a actualizar desde el body
   * @returns SuperheroResponseDto - Superhéroe actualizado
   * 
   * PATCH permite actualizaciones parciales (no todos los campos son requeridos)
   * 
   * Ejemplo:
   * PATCH /superheroes/1
   * {
   *   "powerLevel": 9,
   *   "city": "Nueva Metropolis"
   * }
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSuperheroDto: UpdateSuperheroDto,
  ): Promise<SuperheroResponseDto> {
    return this.superheroService.update(id, updateSuperheroDto);
  }

  /**
   * Eliminar un superhéroe (eliminación física)
   * 
   * DELETE /superheroes/:id
   * 
   * @param id - ID del superhéroe a eliminar
   * @returns { message: string } - Mensaje de confirmación
   * 
   * Elimina físicamente el registro de la base de datos
   * 
   * Ejemplo:
   * DELETE /superheroes/1
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK) // Devuelve código 200 en lugar de 204
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.superheroService.hardDelete(id);
  }


}

/**
 * Resumen de Endpoints:
 * 
 * Crear:     POST   /superheroes
 * Listar:    GET    /superheroes
 * Buscar:    GET    /superheroes/search?alias=nombre
 * Stats:     GET    /superheroes/stats
 * Ver uno:   GET    /superheroes/:id
 * Actualizar: PATCH  /superheroes/:id
 * Eliminar:  DELETE /superheroes/:id (eliminación física)
 * 
 * Filtros disponibles en GET /superheroes:
 * - name: buscar por nombre
 * - city: buscar por ciudad
 * - isActive: filtrar por estado (true/false)
 * - powerLevel: filtrar por nivel de poder (1-10)
 * - limit: limitar resultados (1-100)
 * - offset: saltar resultados (paginación)
 */