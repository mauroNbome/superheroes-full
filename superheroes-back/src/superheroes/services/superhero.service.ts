import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Superhero } from '../entities/superhero.entity';
import { CreateSuperheroDto, UpdateSuperheroDto, SuperheroResponseDto } from '../dto';
import { plainToInstance } from 'class-transformer';

/**
 * SuperheroService - Servicio para manejar la lógica de negocio de superhéroes
 * 
 * @Injectable() marca la clase como un proveedor que puede ser inyectado
 * 
 * Principales responsabilidades:
 * - Operaciones CRUD (Create, Read, Update, Delete)
 * - Validaciones de negocio
 * - Transformación de datos
 * - Manejo de errores específicos del dominio
 */
@Injectable()
export class SuperheroService {
  /**
   * Constructor con inyección de dependencias
   * 
   * @InjectRepository() inyecta el repositorio de TypeORM
   * Repository<Superhero> proporciona métodos para interactuar con la BD
   */
  constructor(
    @InjectRepository(Superhero)
    private readonly superheroRepository: Repository<Superhero>,
  ) {}

  /**
   * Detecta si estamos usando SQLite para ajustar las consultas
   */
  private get isSQLite(): boolean {
    return this.superheroRepository.manager.connection.options.type === 'sqlite';
  }

  /**
   * Crea una búsqueda case-insensitive compatible con SQLite y PostgreSQL
   */
  private createCaseInsensitiveSearch(value: string): any {
    if (this.isSQLite) {
      // SQLite: usar LIKE con UPPER para case-insensitive
      return Like(`%${value.toUpperCase()}%`);
    } else {
      // PostgreSQL: usar ILike
      return ILike(`%${value}%`);
    }
  }

  /**
   * Crea una condición WHERE case-insensitive para QueryBuilder
   */
  private createCaseInsensitiveWhere(column: string, paramName: string, value: string): { condition: string, param: any } {
    if (this.isSQLite) {
      // SQLite: usar UPPER() en ambos lados para case-insensitive
      return {
        condition: `UPPER(${column}) LIKE :${paramName}`,
        param: { [paramName]: `%${value.toUpperCase()}%` }
      };
    } else {
      // PostgreSQL: usar ILIKE
      return {
        condition: `${column} ILIKE :${paramName}`,
        param: { [paramName]: `%${value}%` }
      };
    }
  }

  /**
   * Crear un nuevo superhéroe
   * 
   * @param createSuperheroDto - Datos del superhéroe a crear
   * @returns SuperheroResponseDto - Superhéroe creado
   * @throws ConflictException - Si el alias ya existe
   * @throws BadRequestException - Si los datos son inválidos
   */
  async create(createSuperheroDto: CreateSuperheroDto): Promise<SuperheroResponseDto> {
    // Verificar si ya existe un superhéroe con el mismo alias
    const existingSuperhero = await this.superheroRepository.findOne({
      where: { alias: createSuperheroDto.alias }
    });

    if (existingSuperhero) {
      throw new ConflictException(`Ya existe un superhéroe con el alias "${createSuperheroDto.alias}"`);
    }

    // Crear la entidad superhéroe
    const superhero = this.superheroRepository.create({
      ...createSuperheroDto,
      // Convertir array de poderes a string para almacenar en BD
      powers: createSuperheroDto.powers.join(', '),
    });

    try {
      // Guardar en la base de datos
      const savedSuperhero = await this.superheroRepository.save(superhero);
      
      // Transformar a DTO de respuesta
      return plainToInstance(SuperheroResponseDto, savedSuperhero, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException('Error al crear el superhéroe');
    }
  }

  /**
   * Obtener todos los superhéroes con filtros opcionales
   * 
   * @param filters - Filtros de búsqueda opcionales
   * @returns SuperheroResponseDto[] - Lista de superhéroes
   */
  async findAll(filters?: {
    name?: string;
    city?: string;
    isActive?: boolean;
    powerLevel?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ data: SuperheroResponseDto[]; total: number }> {
    
    const queryBuilder = this.superheroRepository.createQueryBuilder('superhero');

    // Aplicar filtros si existen
    if (filters?.name) {
      const nameWhere = this.createCaseInsensitiveWhere('superhero.name', 'name', filters.name);
      queryBuilder.andWhere(nameWhere.condition, nameWhere.param);
    }

    if (filters?.city) {
      const cityWhere = this.createCaseInsensitiveWhere('superhero.city', 'city', filters.city);
      queryBuilder.andWhere(cityWhere.condition, cityWhere.param);
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('superhero.isActive = :isActive', { 
        isActive: filters.isActive 
      });
    }

    if (filters?.powerLevel) {
      queryBuilder.andWhere('superhero.powerLevel = :powerLevel', { 
        powerLevel: filters.powerLevel 
      });
    }

    // Ordenar por fecha de creación (más recientes primero)
    queryBuilder.orderBy('superhero.createdAt', 'DESC');

    // Paginación
    if (filters?.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters?.offset) {
      queryBuilder.offset(filters.offset);
    }

    // Ejecutar consulta con conteo total
    const [superheroes, total] = await queryBuilder.getManyAndCount();

    // Transformar a DTOs de respuesta
    const data = superheroes.map(superhero => 
      plainToInstance(SuperheroResponseDto, superhero, {
        excludeExtraneousValues: true,
      })
    );

    return { data, total };
  }

  /**
   * Obtener un superhéroe por ID
   * 
   * @param id - ID del superhéroe
   * @returns SuperheroResponseDto - Superhéroe encontrado
   * @throws NotFoundException - Si no se encuentra el superhéroe
   */
  async findOne(id: number): Promise<SuperheroResponseDto> {
    const superhero = await this.superheroRepository.findOne({
      where: { id }
    });

    if (!superhero) {
      throw new NotFoundException(`Superhéroe con ID ${id} no encontrado`);
    }

    return plainToInstance(SuperheroResponseDto, superhero, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Buscar superhéroes por alias (útil para búsquedas)
   * 
   * @param alias - Alias a buscar (búsqueda parcial)
   * @returns SuperheroResponseDto[] - Superhéroes que coinciden
   */
  async findByAlias(alias: string): Promise<SuperheroResponseDto[]> {
    const superheroes = await this.superheroRepository.find({
      where: { 
        alias: this.createCaseInsensitiveSearch(alias),
        isActive: true 
      },
      order: { createdAt: 'DESC' }
    });

    return superheroes.map(superhero => 
      plainToInstance(SuperheroResponseDto, superhero, {
        excludeExtraneousValues: true,
      })
    );
  }

  /**
   * Actualizar un superhéroe existente
   * 
   * @param id - ID del superhéroe a actualizar
   * @param updateSuperheroDto - Datos a actualizar
   * @returns SuperheroResponseDto - Superhéroe actualizado
   * @throws NotFoundException - Si no se encuentra el superhéroe
   * @throws ConflictException - Si el nuevo alias ya existe
   */
  async update(id: number, updateSuperheroDto: UpdateSuperheroDto): Promise<SuperheroResponseDto> {
    // Verificar que el superhéroe existe
    const existingSuperhero = await this.superheroRepository.findOne({
      where: { id }
    });

    if (!existingSuperhero) {
      throw new NotFoundException(`Superhéroe con ID ${id} no encontrado`);
    }

    // Si se está actualizando el alias, verificar que no exista otro con el mismo
    if ('alias' in updateSuperheroDto && updateSuperheroDto.alias && updateSuperheroDto.alias !== existingSuperhero.alias) {
      const superheroWithSameAlias = await this.superheroRepository.findOne({
        where: { alias: updateSuperheroDto.alias }
      });

      if (superheroWithSameAlias) {
        throw new ConflictException(`Ya existe un superhéroe con el alias "${updateSuperheroDto.alias}"`);
      }
    }

    // Preparar datos para actualización
    const updateData: any = { ...updateSuperheroDto };
    
    // Convertir array de poderes a string si se proporciona
    if ('powers' in updateSuperheroDto && updateSuperheroDto.powers) {
      updateData.powers = updateSuperheroDto.powers.join(', ');
    }

    try {
      // Actualizar en la base de datos
      await this.superheroRepository.update(id, updateData);
      
      // Obtener el superhéroe actualizado
      const updatedSuperhero = await this.superheroRepository.findOne({
        where: { id }
      });

      return plainToInstance(SuperheroResponseDto, updatedSuperhero, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException('Error al actualizar el superhéroe');
    }
  }



  /**
   * Eliminar un superhéroe de forma permanente
   * 
   * @param id - ID del superhéroe a eliminar
   * @returns { message: string } - Mensaje de confirmación
   * @throws NotFoundException - Si no se encuentra el superhéroe
   */
  async hardDelete(id: number): Promise<{ message: string }> {
    const result = await this.superheroRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Superhéroe con ID ${id} no encontrado`);
    }

    return { 
      message: `Superhéroe eliminado permanentemente de la base de datos` 
    };
  }

  /**
   * Obtener estadísticas de superhéroes
   * 
   * @returns Estadísticas generales
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byPowerLevel: { [key: string]: number };
    byCities: { [key: string]: number };
  }> {
    const total = await this.superheroRepository.count();
    const active = await this.superheroRepository.count({ where: { isActive: true } });
    const inactive = total - active;

    // Estadísticas por nivel de poder
    const powerLevelStats = await this.superheroRepository
      .createQueryBuilder('superhero')
      .select('superhero.powerLevel', 'powerLevel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('superhero.powerLevel')
      .orderBy('superhero.powerLevel')
      .getRawMany();

    const byPowerLevel = {};
    powerLevelStats.forEach(stat => {
      byPowerLevel[stat.powerLevel] = parseInt(stat.count);
    });

    // Estadísticas por ciudad
    const cityStats = await this.superheroRepository
      .createQueryBuilder('superhero')
      .select('superhero.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .groupBy('superhero.city')
      .orderBy('count', 'DESC')
      .limit(10) // Top 10 ciudades
      .getRawMany();

    const byCities = {};
    cityStats.forEach(stat => {
      byCities[stat.city] = parseInt(stat.count);
    });

    return {
      total,
      active,
      inactive,
      byPowerLevel,
      byCities,
    };
  }
}