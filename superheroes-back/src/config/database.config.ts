import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Superhero } from '../superheroes/entities/superhero.entity';

/**
 * Configuración dinámica de base de datos
 * 
 * Soporta SQLite (desarrollo) y PostgreSQL (producción)
 * Se configura usando variables de entorno
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE || 'sqlite';
  
  // Configuración base común para todas las bases de datos
  const baseConfig: Partial<TypeOrmModuleOptions> = {
    entities: [Superhero],
    synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
    logging: process.env.NODE_ENV === 'development',
  };

  // Configuraciones específicas por tipo de base de datos
  switch (dbType) {
    case 'postgres':
      return {
        ...baseConfig,
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'superuser',
        password: process.env.DB_PASSWORD || 'superpass123',
        database: process.env.DB_DATABASE || 'superheroes',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      } as TypeOrmModuleOptions;

    case 'sqlite':
    default:
      return {
        ...baseConfig,
        type: 'sqlite',
        database: process.env.DB_DATABASE || 'superheroes.db',
      } as TypeOrmModuleOptions;
  }
};

/**
 * Función helper para validar la configuración de la base de datos
 */
export const validateDatabaseConfig = (): void => {
  const requiredEnvVars = {
    postgres: ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'],
    sqlite: [], // SQLite no requiere variables adicionales
  };

  const dbType = process.env.DB_TYPE || 'sqlite';
  const required = requiredEnvVars[dbType] || [];

  const missing = required.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Variables de entorno faltantes para ${dbType}: ${missing.join(', ')}\n` +
      `Asegúrate de configurar estas variables en tu archivo .env o docker-compose.yml`
    );
  }

  console.log(`✅ Configuración de base de datos validada: ${dbType}`);
};