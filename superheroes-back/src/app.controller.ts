import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * AppController - Controlador principal de la aplicación
 * 
 * Un controlador en NestJS es una clase decorada con @Controller()
 * Los controladores son responsables de manejar las peticiones HTTP
 * y devolver respuestas al cliente
 * 
 * @Controller() puede recibir un prefijo de ruta opcional
 * Si no se especifica, las rutas serán relativas a la raíz '/'
 */
@Controller()
export class AppController {
  /**
   * Constructor del controlador
   * 
   * NestJS usa inyección de dependencias para proporcionar servicios
   * Al declarar AppService en el constructor, NestJS automáticamente
   * inyecta una instancia del servicio
   * 
   * @param appService - Servicio que contiene la lógica de negocio
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint GET para la ruta raíz '/'
   * 
   * @Get() es un decorador que define que este método maneja peticiones GET
   * El decorador puede recibir una ruta opcional: @Get('usuarios')
   * 
   * Este método será llamado cuando alguien haga GET http://localhost:3000/
   * 
   * @returns {string} Mensaje de bienvenida
   */
  @Get()
  getHello(): string {
    // Delegamos la lógica al servicio
    // Los controladores deben ser delgados y delegar la lógica a los servicios
    return this.appService.getHello();
  }

  /**
   * Endpoint de health check
   * 
   * Es una buena práctica tener un endpoint para verificar
   * que la API esté funcionando correctamente
   * 
   * @returns {object} Estado de la aplicación
   */
  @Get('health')
  getHealth(): { status: string; timestamp: string; service: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Superheroes API',
    };
  }
}