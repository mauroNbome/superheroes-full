# 🐳 Guía de Orquestación con Docker

Esta guía explica cómo manejar toda la aplicación Superheroes Full Stack usando Docker y Docker Compose.

## 📋 Arquitectura de Servicios

```
🌐 Frontend (Angular) ← Puerto 4200
    ↓
🚀 Backend (NestJS) ← Puerto 3000
    ↓
🗄️ Database (PostgreSQL/SQLite) ← Puerto 5432
```

## 🏗️ Estructura del Proyecto

```
superheroes-full/
├── 📄 docker-compose.yml          ← Producción (PostgreSQL)
├── 📄 docker-compose.dev.yml      ← Desarrollo (SQLite)
├── 📄 env.example                 ← Variables de entorno ejemplo
├── 📁 database/
│   ├── 📄 init.sql               ← Inicialización de PostgreSQL
│   └── 📁 data/                  ← Datos persistentes
├── 📁 superheroes-back/
│   ├── 📄 Dockerfile             ← Imagen de producción
│   ├── 📄 Dockerfile.dev         ← Imagen de desarrollo
│   └── ... (código NestJS)
└── 📁 superheroes-app/
    ├── 📄 Dockerfile             ← Angular (por crear)
    └── ... (código Angular)
```

## 🚀 Comandos Rápidos

### Desarrollo (SQLite)
```bash
# Iniciar en modo desarrollo
docker compose -f docker-compose.dev.yml up -d

# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Detener
docker compose -f docker-compose.dev.yml down
```

### Producción (PostgreSQL)
```bash
# Iniciar en modo producción
docker compose up -d

# Ver logs
docker compose logs -f

# Detener
docker compose down

# Eliminar datos (CUIDADO!)
docker compose down -v
```

## 🔧 Configuración Paso a Paso

### 1. Variables de Entorno

Crea un archivo `.env` basado en `env.example`:

```bash
# Para desarrollo (SQLite)
NODE_ENV=development
DB_TYPE=sqlite
DB_DATABASE=superheroes.db

# Para producción (PostgreSQL)
NODE_ENV=production
DB_TYPE=postgres
DB_HOST=database
DB_USERNAME=superuser
DB_PASSWORD=superpass123
DB_DATABASE=superheroes
```

### 2. Modo Desarrollo

**Características:**
- ✅ SQLite (sin servicio de BD separado)
- ✅ Hot reload automático
- ✅ Logs detallados
- ✅ Setup rápido

**Usar cuando:**
- Desarrollando funcionalidades
- Testing local
- No necesitas datos persistentes complejos

```bash
# Construir e iniciar
docker compose -f docker-compose.dev.yml up --build -d

# Acceder a la aplicación
# Frontend: http://localhost:4200
# Backend:  http://localhost:3000
# Docs API: http://localhost:3000/health
```

### 3. Modo Producción

**Características:**
- ✅ PostgreSQL dedicado
- ✅ Datos persistentes
- ✅ Múltiples conexiones concurrentes
- ✅ Optimizado para performance

**Usar cuando:**
- Deployment a producción
- Testing con datos reales
- Necesitas backup de datos
- Múltiples usuarios

```bash
# Construir e iniciar
docker compose up --build -d

# Verificar que todos los servicios estén saludables
docker compose ps
```

## 📊 Gestión de Datos

### SQLite (Desarrollo)
```bash
# Los datos se guardan en un volumen Docker
# Ubicación: sqlite_data volume

# Backup (opcional)
docker cp container_name:/app/superheroes.db ./backup.db
```

### PostgreSQL (Producción)
```bash
# Backup de la base de datos
docker compose exec database pg_dump -U superuser superheroes > backup.sql

# Restaurar backup
docker compose exec -T database psql -U superuser superheroes < backup.sql

# Acceder a la consola de PostgreSQL
docker compose exec database psql -U superuser -d superheroes
```

## 🔍 Troubleshooting

### El backend no conecta a la base de datos
```bash
# Verificar que la BD esté saludable
docker compose exec database pg_isready -U superuser

# Ver logs de la base de datos
docker compose logs database

# Verificar variables de entorno
docker compose exec backend env | grep DB_
```

### Hot reload no funciona
```bash
# Verificar volúmenes montados
docker compose -f docker-compose.dev.yml config

# Reiniciar solo el backend
docker compose -f docker-compose.dev.yml restart backend-dev
```

### Datos perdidos al reiniciar
```bash
# Verificar volúmenes
docker volume ls

# Los datos deben estar en:
# - postgres_data (producción)
# - sqlite_data (desarrollo)
```

## 🛠️ Comandos Útiles

### Docker Compose
```bash
# Ver estado de servicios
docker compose ps

# Seguir logs de un servicio específico
docker compose logs -f backend

# Ejecutar comando en contenedor
docker compose exec backend npm run test

# Reconstruir un servicio específico
docker compose up --build backend

# Escalar servicios (si es necesario)
docker compose up --scale backend=2
```

### Limpieza
```bash
# Eliminar contenedores parados
docker container prune

# Eliminar imágenes no usadas
docker image prune

# Limpieza completa (CUIDADO!)
docker system prune -a --volumes
```

## 🔄 Flujo de Desarrollo Recomendado

### Para Desarrollo Rápido:
1. `docker compose -f docker-compose.dev.yml up -d`
2. Desarrollar código con hot reload
3. Probar endpoints en `http://localhost:3000`
4. Ver frontend en `http://localhost:4200`

### Para Testing de Producción:
1. `docker compose up -d`
2. Cargar datos de prueba
3. Verificar performance
4. Probar backup/restore

### Para Deployment:
1. Configurar variables de entorno de producción
2. `docker compose up -d`
3. Configurar reverse proxy (nginx)
4. Configurar certificados SSL
5. Configurar monitoreo

## 📈 Próximos Pasos

- [ ] Agregar nginx como reverse proxy
- [ ] Configurar certificados SSL
- [ ] Agregar monitoreo con Prometheus
- [ ] Configurar CI/CD pipeline
- [ ] Agregar backup automatizado
- [ ] Configurar clustering de PostgreSQL