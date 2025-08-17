import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, filter, catchError, tap } from 'rxjs/operators';
import { Hero, HeroCreateRequest, HeroUpdateRequest, HeroLegacy } from '@models/hero';
import { ConfigService } from '@core/config.service';
import { HeroAdapterService } from './hero-adapter.service';

/**
 * Hero management service with HTTP backend integration
 * Conectado dinámicamente al backend NestJS
 */
@Injectable({
  providedIn: 'root'
})
export class HeroService {
  
  /** HTTP client para peticiones al backend */
  private readonly http = inject(HttpClient);
  
  /** Servicio de configuración para URLs dinámicas */
  private readonly config = inject(ConfigService);
  
  /** Servicio adaptador para conversión de modelos */
  private readonly adapter = inject(HeroAdapterService);
  
  /**
   * BehaviorSubject para manejo de estado reactivo
   * Se actualiza con datos del backend
   */
  private heroesSubject = new BehaviorSubject<Hero[]>([]);
  
  /**
   * Observable público para suscripciones de componentes
   */
  public heroes$ = this.heroesSubject.asObservable();

  /**
   * Observable para el formato legacy (compatibilidad con componentes existentes)
   */
  public heroesLegacy$ = this.heroes$.pipe(
    map(heroes => this.adapter.convertMultipleToLegacy(heroes))
  );

  constructor() {
    // Cargar héroes al inicializar el servicio
    this.loadHeroes();
    
    // Log de configuración en desarrollo
    if (!this.config.getConfig().isProduction) {
      console.log('🦸‍♂️ HeroService inicializado con API:', this.config.api.superheroes);
    }
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} falló:`, error);
      
      // Log del error para debugging
      if (!this.config.getConfig().isProduction) {
        console.error('Error details:', {
          operation,
          url: error.url,
          status: error.status,
          message: error.message,
          error: error.error
        });
      }

      // Retornar resultado por defecto para mantener la app funcionando
      return of(result as T);
    };
  }

  /**
   * Cargar todos los héroes desde el backend
   */
  private loadHeroes(): void {
    this.http.get<{ data: Hero[]; total: number }>(this.config.api.superheroes)
      .pipe(
        catchError(this.handleError<{ data: Hero[]; total: number }>('loadHeroes', { data: [], total: 0 }))
      )
      .subscribe(response => {
        this.heroesSubject.next(response.data);
      });
  }

  /**
   * Obtener héroe por ID desde el backend
   */
  getHeroById(id: number): Observable<Hero | undefined> {
    return this.http.get<Hero>(`${this.config.api.superheroes}/${id}`)
      .pipe(
        catchError(this.handleError<Hero>('getHeroById'))
      );
  }

  /**
   * Crear nuevo héroe en el backend (método legacy para compatibilidad)
   */
  createHero(heroData: HeroCreateRequest | HeroLegacy): Observable<Hero> {
    // Detectar si es formato legacy y convertir
    const backendData = this.isLegacyHero(heroData) 
      ? this.adapter.fromLegacy(heroData)
      : heroData;

    return this.http.post<Hero>(this.config.api.superheroes, backendData)
      .pipe(
        tap(newHero => {
          // Actualizar estado local con el nuevo héroe
          const currentHeroes = this.heroesSubject.value;
          this.heroesSubject.next([...currentHeroes, newHero]);
        }),
        catchError(this.handleError<Hero>('createHero'))
      );
  }

  /**
   * Crear héroe desde formulario legacy
   */
  createHeroLegacy(heroData: HeroLegacy): Observable<Hero> {
    // Validar datos legacy
    const validationErrors = this.adapter.validateLegacyHero(heroData);
    if (validationErrors.length > 0) {
      return throwError(() => new Error(`Validation errors: ${validationErrors.join(', ')}`));
    }

    // Convertir a formato del backend con datos enriquecidos
    const enhancedData = this.adapter.createEnhancedHero(heroData);

    return this.http.post<Hero>(this.config.api.superheroes, enhancedData)
      .pipe(
        tap(newHero => {
          const currentHeroes = this.heroesSubject.value;
          this.heroesSubject.next([...currentHeroes, newHero]);
        }),
        catchError(this.handleError<Hero>('createHeroLegacy'))
      );
  }

  /**
   * Actualizar héroe existente en el backend (formato nuevo)
   */
  updateHero(heroData: HeroUpdateRequest): Observable<Hero> {
    const { id, ...updateData } = heroData;

    return this.http.patch<Hero>(`${this.config.api.superheroes}/${id}`, updateData)
      .pipe(
        tap(updatedHero => {
          // Actualizar estado local
          const currentHeroes = this.heroesSubject.value;
          const heroIndex = currentHeroes.findIndex(hero => hero.id === id);
          if (heroIndex !== -1) {
            const updatedHeroes = [...currentHeroes];
            updatedHeroes[heroIndex] = updatedHero;
            this.heroesSubject.next(updatedHeroes);
          }
        }),
        catchError(this.handleError<Hero>('updateHero'))
      );
  }

  /**
   * Eliminar héroe por ID
   */
  deleteHero(id: number): Observable<boolean> {
    return this.http.delete<{ message: string }>(`${this.config.api.superheroes}/${id}`)
      .pipe(
        map(() => {
          // Actualizar estado local eliminando el héroe
          const currentHeroes = this.heroesSubject.value;
          const updatedHeroes = currentHeroes.filter(hero => hero.id !== id);
          this.heroesSubject.next(updatedHeroes);
          return true;
        }),
        catchError(this.handleError<boolean>('deleteHero', false))
      );
  }

  /**
   * Buscar y paginar héroes desde el backend
   */
  searchHeroesByNamePaginated(
    name: string, 
    page: number = 1, 
    pageSize: number = 5
  ): Observable<{
    heroes: Hero[],
    totalItems: number,
    totalPages: number,
    currentPage: number
  }> {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    if (name.trim()) {
      params.append('name', name.trim());
    }
    params.append('limit', pageSize.toString());
    params.append('offset', ((page - 1) * pageSize).toString());

    const url = `${this.config.api.superheroes}?${params.toString()}`;

    return this.http.get<{ data: Hero[]; total: number; pagination: any }>(url)
      .pipe(
        map(response => {
          const totalPages = Math.ceil(response.total / pageSize);
          return {
            heroes: response.data,
            totalItems: response.total,
            totalPages,
            currentPage: page
          };
        }),
        catchError(this.handleError<any>('searchHeroesByNamePaginated', {
          heroes: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: page
        }))
      );
  }

  /**
   * Recargar héroes desde el backend
   */
  refreshHeroes(): void {
    this.loadHeroes();
  }

  /**
   * Obtener héroe por ID en formato legacy
   */
  getHeroByIdLegacy(id: number): Observable<HeroLegacy | undefined> {
    return this.getHeroById(id).pipe(
      map(hero => hero ? this.adapter.toLegacy(hero) : undefined)
    );
  }

  /**
   * Buscar héroes en formato legacy (compatible con componentes existentes)
   */
  searchHeroesByNamePaginatedLegacy(
    name: string, 
    page: number = 1, 
    pageSize: number = 5
  ): Observable<{
    heroes: HeroLegacy[],
    totalItems: number,
    totalPages: number,
    currentPage: number
  }> {
    return this.searchHeroesByNamePaginated(name, page, pageSize).pipe(
      map(response => ({
        ...response,
        heroes: this.adapter.convertMultipleToLegacy(response.heroes)
      }))
    );
  }

  /**
   * Actualizar héroe en formato legacy
   */
  updateHeroLegacy(heroData: Partial<HeroLegacy> & { id: number }): Observable<Hero> {
    // Convertir datos legacy a formato del backend
    const currentHero = this.heroesSubject.value.find(h => h.id === heroData.id);
    if (!currentHero) {
      return throwError(() => new Error(`No se encontró el héroe con ID ${heroData.id}`));
    }

    const backendData: any = {};
    
    if (heroData.name) {
      backendData.name = heroData.name;
      backendData.alias = heroData.name;
    }
    if (heroData.superpower) {
      backendData.powers = [heroData.superpower];
    }
    if (heroData.alterEgo) {
      const currentDescription = currentHero.description || '';
      backendData.description = currentDescription.replace(
        /Alter ego:\s*[^.]+/i, 
        `Alter ego: ${heroData.alterEgo}`
      ) || `Alter ego: ${heroData.alterEgo}`;
    }
    if (heroData.isActive !== undefined) {
      backendData.isActive = heroData.isActive;
    }

    return this.http.patch<Hero>(`${this.config.api.superheroes}/${heroData.id}`, backendData)
      .pipe(
        tap(updatedHero => {
          const currentHeroes = this.heroesSubject.value;
          const heroIndex = currentHeroes.findIndex(hero => hero.id === heroData.id);
          if (heroIndex !== -1) {
            const updatedHeroes = [...currentHeroes];
            updatedHeroes[heroIndex] = updatedHero;
            this.heroesSubject.next(updatedHeroes);
          }
        }),
        catchError(this.handleError<Hero>('updateHeroLegacy'))
      );
  }

  /**
   * Helper para detectar si un objeto es del formato legacy
   */
  private isLegacyHero(hero: any): hero is HeroLegacy {
    return 'superpower' in hero && 'alterEgo' in hero && 'firstAppearance' in hero;
  }

  /**
   * Obtener resumen de héroes para listas optimizadas
   */
  getHeroesSummary(): Observable<Array<ReturnType<HeroAdapterService['getHeroSummary']>>> {
    return this.heroes$.pipe(
      map(heroes => heroes.map(hero => this.adapter.getHeroSummary(hero)))
    );
  }
} 