import { Injectable } from '@nestjs/common';

/**
 * AppService - Servicio principal de la aplicación
 * 
 * Un servicio en NestJS es una clase decorada con @Injectable()
 * Los servicios contienen la lógica de negocio de la aplicación
 * 
 * @Injectable() marca la clase como un proveedor que puede ser inyectado
 * en otros componentes (controladores, otros servicios, etc.)
 * 
 * Principios importantes:
 * - Los servicios deben ser independientes de la capa de presentación (HTTP)
 * - Deben ser reutilizables y testeable
 * - Pueden inyectar otros servicios o dependencias
 */
@Injectable()
export class AppService {
  /**
   * Método que devuelve un mensaje de bienvenida
   * 
   * En una aplicación real, este servicio podría:
   * - Interactuar con bases de datos
   * - Llamar a APIs externas
   * - Procesar datos complejos
   * - Implementar lógica de negocio
   * 
   * @returns {string} Mensaje de bienvenida
   */
  getHello(): string {
    return '¡Bienvenido a la API de Superhéroes! 🦸‍♂️🦸‍♀️';
  }

  /**
   * Ejemplo de método que podría contener lógica más compleja
   * 
   * En el futuro, este servicio podría tener métodos como:
   * - validarSuperhéroe()
   * - calcularPoderíos()
   * - buscarPorCiudad()
   * - etc.
   */
  getAppInfo(): { name: string; version: string; description: string } {
    return {
      name: 'Superheroes API',
      version: '1.0.0',
      description: 'API REST para gestión de superhéroes construida con NestJS y TypeORM',
    };
  }
}