import { Injectable } from '@angular/core';
import { Hero, HeroCreateRequest, HeroLegacy, HeroAdapter } from '@models/hero';

/**
 * Servicio adaptador para convertir entre modelos legacy y nuevos
 * Facilita la migración gradual del formulario actual al nuevo modelo del backend
 */
@Injectable({
  providedIn: 'root'
})
export class HeroAdapterService implements HeroAdapter {

  /**
   * Convierte del modelo legacy (formulario actual) al nuevo modelo del backend
   */
  fromLegacy(legacy: HeroLegacy): HeroCreateRequest {
    return {
      name: legacy.name,
      alias: legacy.name, // Usar el nombre como alias por defecto
      powers: [legacy.superpower], // Convertir superpower único a array
      city: 'Unknown', // Ciudad por defecto hasta actualizar formulario
      description: `Alter ego: ${legacy.alterEgo}. First appearance: ${legacy.firstAppearance.toLocaleDateString()}`,
      powerLevel: 5, // Nivel de poder por defecto (medio)
      isActive: legacy.isActive
    };
  }

  /**
   * Convierte del modelo nuevo del backend al modelo legacy para el formulario
   */
  toLegacy(hero: Hero): HeroLegacy {
    return {
      id: hero.id,
      name: hero.name,
      superpower: hero.powers[0] || 'Unknown Power', // Tomar el primer poder
      alterEgo: this.extractAlterEgo(hero.description), // Extraer alter ego de la descripción
      firstAppearance: this.extractFirstAppearance(hero.description), // Extraer fecha de la descripción
      isActive: hero.isActive
    };
  }

  /**
   * Crea un superhéroe completo para el backend con datos mejorados
   */
  createEnhancedHero(legacy: HeroLegacy, additionalData?: {
    alias?: string;
    city?: string;
    powerLevel?: number;
    imageUrl?: string;
  }): HeroCreateRequest {
    const baseHero = this.fromLegacy(legacy);
    
    return {
      ...baseHero,
      alias: additionalData?.alias || baseHero.alias,
      city: additionalData?.city || this.inferCityFromName(legacy.name),
      powerLevel: additionalData?.powerLevel || this.inferPowerLevel(legacy.superpower),
      imageUrl: additionalData?.imageUrl,
    };
  }

  /**
   * Extrae el alter ego de la descripción
   */
  private extractAlterEgo(description?: string): string {
    if (!description) return 'Unknown';
    
    const match = description.match(/Alter ego:\s*([^.]+)/i);
    return match ? match[1].trim() : 'Unknown';
  }

  /**
   * Extrae la fecha de primera aparición de la descripción
   */
  private extractFirstAppearance(description?: string): Date {
    if (!description) return new Date();
    
    const match = description.match(/First appearance:\s*([^.]+)/i);
    if (match) {
      const dateStr = match[1].trim();
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    
    return new Date();
  }

  /**
   * Infiere la ciudad basándose en el nombre del héroe
   */
  private inferCityFromName(name: string): string {
    const cityMap: { [key: string]: string } = {
      'superman': 'Metropolis',
      'batman': 'Gotham City',
      'wonder woman': 'Themyscira',
      'aquaman': 'Atlantis',
      'flash': 'Central City',
      'green lantern': 'Coast City',
      'spider-man': 'New York',
      'iron man': 'New York',
      'thor': 'Asgard',
      'hulk': 'New York'
    };

    const heroName = name.toLowerCase();
    for (const [hero, city] of Object.entries(cityMap)) {
      if (heroName.includes(hero)) {
        return city;
      }
    }

    return 'Unknown City';
  }

  /**
   * Infiere el nivel de poder basándose en el superpoder
   */
  private inferPowerLevel(superpower: string): number {
    const powerKeywords = {
      10: ['omnipotent', 'cosmic', 'reality manipulation', 'time control'],
      9: ['invulnerability', 'super strength', 'flight', 'laser vision'],
      8: ['super speed', 'invisibility', 'teleportation', 'mind control'],
      7: ['enhanced strength', 'energy projection', 'weather control'],
      6: ['enhanced agility', 'martial arts', 'advanced technology'],
      5: ['enhanced senses', 'stealth', 'intelligence'],
      4: ['minor telepathy', 'basic magic', 'enhanced reflexes'],
      3: ['good fighting skills', 'basic gadgets']
    };

    const lowerPower = superpower.toLowerCase();
    
    for (const [level, keywords] of Object.entries(powerKeywords)) {
      if (keywords.some(keyword => lowerPower.includes(keyword))) {
        return parseInt(level);
      }
    }

    return 5; // Nivel por defecto
  }

  /**
   * Valida si un superhéroe legacy tiene todos los campos requeridos
   */
  validateLegacyHero(hero: Partial<HeroLegacy>): string[] {
    const errors: string[] = [];

    if (!hero.name?.trim()) {
      errors.push('Name is required');
    }

    if (!hero.superpower?.trim()) {
      errors.push('Superpower is required');
    }

    if (!hero.alterEgo?.trim()) {
      errors.push('Alter ego is required');
    }

    if (!hero.firstAppearance || isNaN(hero.firstAppearance.getTime())) {
      errors.push('Valid first appearance date is required');
    }

    return errors;
  }

  /**
   * Convierte múltiples héroes del backend al formato legacy
   */
  convertMultipleToLegacy(heroes: Hero[]): HeroLegacy[] {
    return heroes.map(hero => this.toLegacy(hero));
  }

  /**
   * Obtiene un resumen del héroe para mostrar en listas
   */
  getHeroSummary(hero: Hero): {
    id: number;
    name: string;
    alias: string;
    primaryPower: string;
    city: string;
    level: string;
    isActive: boolean;
  } {
    return {
      id: hero.id,
      name: hero.name,
      alias: hero.alias,
      primaryPower: hero.powers[0] || 'Unknown',
      city: hero.city,
      level: hero.powerLevelDescription,
      isActive: hero.isActive
    };
  }
}