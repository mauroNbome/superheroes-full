import { Exclude, Expose, Transform } from 'class-transformer';

/**
 * DTO de respuesta para superhéroes
 * 
 * Este DTO define qué datos se devuelven al cliente
 * y permite transformar los datos antes de enviarlos
 * 
 * @Exclude() - Excluye propiedades por defecto
 * @Expose() - Expone propiedades específicas
 * @Transform() - Transforma el valor antes de enviarlo
 */
@Exclude() // Por defecto, excluir todas las propiedades
export class SuperheroResponseDto {
  /**
   * ID del superhéroe
   */
  @Expose()
  id: number;

  /**
   * Nombre real
   */
  @Expose()
  name: string;

  /**
   * Alias del superhéroe
   */
  @Expose()
  alias: string;

  /**
   * Lista de poderes como array
   * Transformamos el string de la BD a array para el cliente
   */
  @Expose()
  @Transform(({ obj }) => {
    // Convertir el string de poderes a array
    return obj.powers ? obj.powers.split(',').map(power => power.trim()) : [];
  })
  powers: string[];

  /**
   * Ciudad donde opera
   */
  @Expose()
  city: string;

  /**
   * Descripción
   */
  @Expose()
  description?: string;

  /**
   * URL de imagen
   */
  @Expose()
  imageUrl?: string;

  /**
   * Nivel de poder
   */
  @Expose()
  powerLevel: number;

  /**
   * Estado activo
   */
  @Expose()
  isActive: boolean;

  /**
   * Fecha de creación formateada
   */
  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: string;

  /**
   * Fecha de actualización formateada
   */
  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: string;

  /**
   * Campo calculado: cantidad de poderes
   */
  @Expose()
  @Transform(({ obj }) => {
    const powersArray = obj.powers ? obj.powers.split(',').map(power => power.trim()) : [];
    return powersArray.length;
  })
  powerCount: number;

  /**
   * Campo calculado: descripción del nivel de poder
   */
  @Expose()
  @Transform(({ obj }) => {
    const level = obj.powerLevel;
    if (level <= 3) return 'Principiante';
    if (level <= 6) return 'Intermedio';
    if (level <= 8) return 'Avanzado';
    return 'Élite';
  })
  powerLevelDescription: string;
}