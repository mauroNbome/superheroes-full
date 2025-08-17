# ========================================
# DOCKERFILE PARA ANGULAR - PRODUCCIÓN
# ========================================

# Etapa 1: Build de la aplicación Angular
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir aplicación para producción
RUN npm run build --prod

# ========================================

# Etapa 2: Servir con nginx
FROM nginx:alpine AS production

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos desde la etapa builder
COPY --from=builder /app/dist/superheroes-app /usr/share/nginx/html

# Copiar script de inicialización
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Hacer el script ejecutable
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto 80
EXPOSE 80

# Usar el script de inicialización como entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]