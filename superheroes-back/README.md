# 🦸‍♂️ Superheroes API - Backend

API REST construida con NestJS para la gestión de superhéroes.

## 📋 Características

- **Framework**: NestJS con TypeScript
- **Base de Datos**: SQLite con TypeORM
- **Validación**: class-validator y class-transformer
- **Arquitectura**: Modular con inyección de dependencias
- **CORS**: Configurado para desarrollo con Angular

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### Pasos

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo**
   ```bash
   npm run start:dev
   ```

3. **Construir para producción**
   ```bash
   npm run build
   npm run start:prod
   ```

## 📡 Endpoints Disponibles

### Básicos
- `GET /` - Mensaje de bienvenida
- `GET /health` - Health check de la aplicación

## 🏗️ Estructura del Proyecto

```
src/
├── main.ts           # Punto de entrada de la aplicación
├── app.module.ts     # Módulo raíz
├── app.controller.ts # Controlador principal
└── app.service.ts    # Servicio principal
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Tests de cobertura
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 📦 Scripts Disponibles

- `npm run start` - Ejecutar aplicación
- `npm run start:dev` - Ejecutar en modo desarrollo (watch)
- `npm run start:debug` - Ejecutar en modo debug
- `npm run build` - Construir aplicación
- `npm run format` - Formatear código
- `npm run lint` - Verificar calidad de código

## 🔧 Configuración

La aplicación utiliza las siguientes configuraciones por defecto:

- **Puerto**: 3000
- **Base de datos**: SQLite (superheroes.db)
- **CORS**: Habilitado para http://localhost:4200

## 📚 Conceptos de NestJS

### Módulos
Los módulos organizan el código en unidades cohesivas. Cada módulo agrupa controladores, servicios y otros providers relacionados.

### Controladores
Manejan las peticiones HTTP y definen los endpoints de la API.

### Servicios (Providers)
Contienen la lógica de negocio y pueden ser inyectados en controladores u otros servicios.

### Inyección de Dependencias
NestJS maneja automáticamente la creación e inyección de dependencias.

## 🔄 Próximos Pasos

1. Crear entidades para superhéroes
2. Implementar CRUD completo
3. Agregar validaciones
4. Implementar filtros y paginación
5. Agregar autenticación
6. Documentar API con Swagger