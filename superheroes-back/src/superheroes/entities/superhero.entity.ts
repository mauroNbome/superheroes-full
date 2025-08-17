import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad Superhero - Representa un superhéroe en la base de datos
 * 
 * En TypeORM, una entidad es una clase que mapea a una tabla de base de datos
 * Los decoradores definen cómo se estructura la tabla:
 * 
 * @Entity() - Marca la clase como una entidad de base de datos
 * @PrimaryGeneratedColumn() - Define la clave primaria auto-incrementable
 * @Column() - Define una columna en la tabla
 * @CreateDateColumn() - Columna que se llena automáticamente al crear
 * @UpdateDateColumn() - Columna que se actualiza automáticamente al modificar
 */
@Entity('superheroes') // Nombre de la tabla en la base de datos
export class Superhero {
  /**
   * ID único del superhéroe
   * PrimaryGeneratedColumn genera automáticamente valores únicos
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Nombre real del superhéroe
   * @Column() con opciones de configuración
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'Nombre real del superhéroe'
  })
  name: string;

  /**
   * Alias o nombre de superhéroe
   * unique: true asegura que no haya duplicados
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
    comment: 'Alias o nombre de superhéroe (único)'
  })
  alias: string;

  /**
   * Lista de superpoderes
   * Almacenamos como texto y luego parseamos como array
   */
  @Column({
    type: 'text',
    nullable: false,
    comment: 'Lista de superpoderes separados por comas'
  })
  powers: string;

  /**
   * Ciudad donde opera el superhéroe
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'Ciudad donde opera el superhéroe'
  })
  city: string;

  /**
   * Descripción del superhéroe
   */
  @Column({
    type: 'text',
    nullable: true,
    comment: 'Descripción detallada del superhéroe'
  })
  description?: string;

  /**
   * URL de la imagen del superhéroe
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'URL de la imagen del superhéroe'
  })
  imageUrl?: string;

  /**
   * Nivel de poder (1-10)
   */
  @Column({
    type: 'integer',
    nullable: false,
    default: 5,
    comment: 'Nivel de poder del 1 al 10'
  })
  powerLevel: number;

  /**
   * Indica si el superhéroe está activo
   */
  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    comment: 'Indica si el superhéroe está activo'
  })
  isActive: boolean;

  /**
   * Fecha de creación del registro
   * Se llena automáticamente cuando se crea el registro
   */
  @CreateDateColumn({
    comment: 'Fecha de creación del registro'
  })
  createdAt: Date;

  /**
   * Fecha de última actualización
   * Se actualiza automáticamente cuando se modifica el registro
   */
  @UpdateDateColumn({
    comment: 'Fecha de última actualización del registro'
  })
  updatedAt: Date;

  /**
   * Método getter para obtener los poderes como array
   * Convierte el string de poderes separados por comas en un array
   */
  getPowersArray(): string[] {
    return this.powers ? this.powers.split(',').map(power => power.trim()) : [];
  }

  /**
   * Método setter para establecer los poderes desde un array
   * Convierte un array de poderes en un string separado por comas
   */
  setPowersArray(powers: string[]): void {
    this.powers = powers.join(', ');
  }
}