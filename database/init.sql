-- ========================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- Se ejecuta automáticamente cuando se crea el contenedor PostgreSQL
-- ========================================

-- Crear base de datos si no existe (ya se crea por variable de entorno)
-- CREATE DATABASE IF NOT EXISTS superheroes;

-- Conectar a la base de datos
\c superheroes;

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ========================================

-- Insertar algunos superhéroes de ejemplo cuando se inicializa la BD
-- (TypeORM creará las tablas automáticamente)

-- Nota: Estos INSERT se ejecutarán después de que TypeORM cree las tablas
-- En un entorno real, podrías usar migrations de TypeORM para esto

-- ========================================
-- CONFIGURACIONES DE BASE DE DATOS
-- ========================================

-- Configurar timezone
SET timezone = 'UTC';

-- Configurar encoding
SET client_encoding = 'UTF8';

-- Log de inicialización
SELECT 'Base de datos Superheroes inicializada correctamente' AS status;