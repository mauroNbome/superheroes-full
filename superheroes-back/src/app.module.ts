import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuperheroModule } from './superheroes/superhero.module';
import { getDatabaseConfig } from './config/database.config';

/**
 * AppModule es el módulo raíz de la aplicación
 * 
 * En NestJS, un módulo es una clase decorada con @Module()
 * Los módulos organizan el código en unidades cohesivas
 * 
 * El decorador @Module() toma un objeto con estas propiedades:
 * - imports: Módulos necesarios para este módulo
 * - controllers: Controladores que pertenecen a este módulo
 * - providers: Proveedores (servicios) disponibles en este módulo
 * - exports: Proveedores que este módulo exporta para otros módulos
 */
@Module({
  imports: [
    // Configuración dinámica de base de datos
    // Usa SQLite en desarrollo y PostgreSQL en producción
    // Se configura automáticamente según las variables de entorno
    TypeOrmModule.forRoot(getDatabaseConfig()),
    
    // Importamos el módulo de superhéroes
    // Esto registra todos los controladores, servicios y providers del módulo
    SuperheroModule,
  ],
  controllers: [
    // Los controladores manejan las peticiones HTTP
    AppController, // Controlador principal
  ],
  providers: [
    // Los providers son servicios que pueden ser inyectados
    AppService, // Servicio principal
  ],
})
export class AppModule {
  /**
   * Los módulos en NestJS pueden tener métodos de ciclo de vida
   * como onModuleInit(), onModuleDestroy(), etc.
   * 
   * Por ahora nuestro módulo es simple y no necesita lógica adicional
   */
}