import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Servicio de configuración que maneja URLs dinámicas
 * según el entorno (local, Docker desarrollo, Docker producción)
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  private config = {
    apiUrl: this.getApiUrl(),
    environment: this.getEnvironmentType(),
    isDocker: this.isDockerEnvironment(),
    isDevelopment: !environment.production,
    isProduction: environment.production
  };

  constructor() {
    console.log('🔧 ConfigService inicializado:', this.config);
  }

  /**
   * Obtiene la URL de la API según el entorno
   */
  getApiUrl(): string {
    // 1. Prioridad: Variables de entorno de Docker
    if ((window as any).__env?.apiUrl) {
      return (window as any).__env.apiUrl;
    }

    // 2. Usar configuración del environment
    return environment.apiUrl;
  }

  /**
   * Detecta si estamos ejecutando en Docker
   */
  isDockerEnvironment(): boolean {
    return (window as any).__env?.dockerEnv === true ||
           (window as any).__env?.dockerEnv === 'true';
  }

  /**
   * Obtiene el tipo de entorno
   */
  getEnvironmentType(): string {
    if ((window as any).__env?.environment) {
      return (window as any).__env.environment;
    }
    return environment.production ? 'production' : 'development';
  }

  /**
   * Construye URL completa para endpoints de la API
   */
  buildApiUrl(endpoint: string): string {
    const baseUrl = this.getApiUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Obtiene toda la configuración
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * URLs específicas de la API
   */
  get api() {
    const baseUrl = this.getApiUrl();
    return {
      superheroes: `${baseUrl}/superheroes`,
      health: `${baseUrl}/health`,
      stats: `${baseUrl}/superheroes/stats`,
      search: `${baseUrl}/superheroes/search`
    };
  }

  /**
   * Información de debug (solo en desarrollo)
   */
  debugInfo() {
    if (!environment.production) {
      return {
        ...this.config,
        windowEnv: (window as any).__env || {},
        hostname: window.location.hostname,
        origin: window.location.origin,
        environmentFile: environment
      };
    }
    return null;
  }
}