# ========================================
# DOCKERFILE PARA NESTJS - PRODUCCIÓN
# ========================================

# Etapa 1: Build de la aplicación
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# ========================================

# Etapa 2: Imagen de producción
FROM node:18-alpine AS production

# Instalar dependencias del sistema necesarias para SQLite
RUN apk add --no-cache sqlite

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias desde builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Copiar archivos de configuración
COPY --from=builder /app/package*.json ./

# Crear directorio para la base de datos
RUN mkdir -p /app/database && chown -R nestjs:nodejs /app

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["node", "dist/main"]