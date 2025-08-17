import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Función principal que inicia la aplicación NestJS
 * Esta función es asíncrona porque NestFactory.create() devuelve una Promise
 */
async function bootstrap() {
  // Crear la instancia de la aplicación NestJS
  // NestFactory.create() es el método principal para crear una aplicación NestJS
  // Le pasamos el módulo raíz (AppModule) como parámetro
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS (Cross-Origin Resource Sharing)
  // Esto permite que el frontend (Angular) se comunique con el backend
  app.enableCors({
    origin: 'http://localhost:4200', // URL del frontend Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configurar ValidationPipe globalmente
  // ValidationPipe valida automáticamente los DTOs usando class-validator
  // transform: true convierte automáticamente los tipos de datos
  // whitelist: true elimina propiedades que no estén en el DTO
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Configurar el puerto del servidor
  // Usar 3000 como puerto por defecto
  const port = 3000;
  
  // Iniciar el servidor en el puerto especificado
  await app.listen(port);
  
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
}

// Llamar a la función bootstrap para iniciar la aplicación
// Capturar cualquier error durante el inicio
bootstrap().catch(err => {
  console.error('❌ Error al iniciar la aplicación:', err);
});