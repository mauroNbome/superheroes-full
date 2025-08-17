/**
 * Modelo de superhéroe alineado con el backend NestJS
 */
export interface Hero {
  id: number;
  name: string;
  alias: string;
  powers: string[];
  city: string;
  description?: string;
  imageUrl?: string;
  powerLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Campos calculados del backend
  powerCount: number;
  powerLevelDescription: string;
}

/**
 * Interfaz para crear un nuevo superhéroe
 */
export interface HeroCreateRequest {
  name: string;
  alias: string;
  powers: string[];
  city: string;
  description?: string;
  imageUrl?: string;
  powerLevel: number;
  isActive?: boolean;
}

/**
 * Interfaz para actualizar un superhéroe existente
 */
export interface HeroUpdateRequest extends Partial<HeroCreateRequest> {
  id: number;
}

/**
 * Interfaz legacy para compatibilidad con el formulario actual
 * TODO: Migrar gradualmente al nuevo modelo
 */
export interface HeroLegacy {
  id: number;
  name: string;
  superpower: string;
  alterEgo: string;
  firstAppearance: Date;
  isActive: boolean;
}

/**
 * Interfaz para convertir entre modelos legacy y nuevos
 */
export interface HeroAdapter {
  fromLegacy(legacy: HeroLegacy): HeroCreateRequest;
  toLegacy(hero: Hero): HeroLegacy;
} 