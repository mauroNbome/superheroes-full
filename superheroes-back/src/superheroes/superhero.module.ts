import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Superhero } from './entities/superhero.entity';
import { SuperheroService } from './services/superhero.service';
import { SuperheroController } from './controllers/superhero.controller';

/**
 * SuperheroModule - Módulo que organiza todos los componentes relacionados con superhéroes
 * 
 * En NestJS, los módulos son la unidad organizativa principal
 * Cada módulo agrupa funcionalidades relacionadas:
 * - Entidades (modelos de datos)
 * - Servicios (lógica de negocio)
 * - Controladores (endpoints HTTP)
 * - DTOs (validación de datos)
 * 
 * Principios del módulo:
 * - Cohesión: todo está relacionado con superhéroes
 * - Encapsulación: oculta detalles internos
 * - Reutilización: puede ser importado por otros módulos
 * - Separación de responsabilidades: cada componente tiene su función
 */
@Module({
  /**
   * imports: Módulos que este módulo necesita
   * 
   * TypeOrmModule.forFeature([Superhero]) registra la entidad Superhero
   * Esto permite inyectar Repository<Superhero> en los servicios
   * 
   * Es equivalente a decir: "Este módulo trabajará con la entidad Superhero"
   */
  imports: [
    TypeOrmModule.forFeature([Superhero])
  ],

  /**
   * controllers: Controladores que pertenecen a este módulo
   * 
   * Los controladores manejan las peticiones HTTP entrantes
   * SuperheroController maneja todas las rutas /superheroes/*
   * 
   * NestJS automáticamente registra las rutas definidas en el controlador
   */
  controllers: [
    SuperheroController
  ],

  /**
   * providers: Servicios disponibles en este módulo
   * 
   * Los providers son clases que pueden ser inyectadas como dependencias
   * SuperheroService contiene toda la lógica de negocio
   * 
   * NestJS maneja automáticamente la inyección de dependencias
   */
  providers: [
    SuperheroService
  ],

  /**
   * exports: Providers que este módulo hace disponibles para otros módulos
   * 
   * Si otros módulos necesitan usar SuperheroService,
   * deben importar SuperheroModule
   * 
   * Ejemplo: Si UserModule necesita verificar si un usuario es superhéroe,
   * puede importar SuperheroModule y usar SuperheroService
   */
  exports: [
    SuperheroService
  ],
})
export class SuperheroModule {
  /**
   * Los módulos pueden tener constructores para inicialización
   * Por ejemplo, para configurar logging específico del módulo
   * 
   * constructor() {
   *   console.log('SuperheroModule inicializado');
   * }
   */
}

/**
 * Diagrama de dependencias del módulo:
 * 
 * SuperheroModule
 * ├── TypeOrmModule.forFeature([Superhero])  ← Configuración de BD
 * ├── SuperheroController                    ← Endpoints HTTP
 * └── SuperheroService                       ← Lógica de negocio
 *     └── Repository<Superhero>              ← Acceso a datos (inyectado por TypeORM)
 * 
 * Flujo de datos:
 * 1. Cliente HTTP → SuperheroController
 * 2. SuperheroController → SuperheroService
 * 3. SuperheroService → Repository<Superhero>
 * 4. Repository<Superhero> → Base de datos
 * 5. Respuesta sigue el camino inverso
 * 
 * Ventajas de esta arquitectura:
 * - Separación clara de responsabilidades
 * - Fácil testing (se pueden mockear las dependencias)
 * - Reutilización de servicios
 * - Mantenimiento sencillo
 * - Escalabilidad
 */