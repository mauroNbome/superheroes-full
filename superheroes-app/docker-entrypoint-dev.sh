#!/bin/sh

# ========================================
# SCRIPT DE INICIALIZACIÓN PARA ANGULAR EN DESARROLLO
# ========================================

echo "🔧 Inicializando aplicación Angular en modo desarrollo..."

# Crear archivo de configuración dinâmico con variables de entorno
cat > /app/src/assets/env.js << EOF
/**
 * Configuración de variables de entorno generada por Docker (Desarrollo)
 * Generado automáticamente en: $(date)
 */

(function(window) {
  window.__env = window.__env || {};

  // Variables de entorno pasadas desde Docker Compose
  window.__env.apiUrl = '${API_URL:-http://localhost:3000}';
  window.__env.dockerEnv = ${DOCKER_ENV:-true};
  window.__env.environment = '${NODE_ENV:-development}';
  window.__env.debugMode = true;
  
  // Información adicional
  window.__env.version = '${APP_VERSION:-1.0.0-dev}';
  window.__env.buildDate = '$(date -u +"%Y-%m-%dT%H:%M:%SZ")';

  console.log('🔧 Variables de entorno cargadas (desarrollo):', window.__env);
})(this);
EOF

echo "✅ Archivo env.js generado para desarrollo:"
echo "   - API_URL: ${API_URL:-http://localhost:3000}"
echo "   - DOCKER_ENV: ${DOCKER_ENV:-true}"
echo "   - NODE_ENV: ${NODE_ENV:-development}"

# Mostrar el contenido del archivo para debug
echo "📄 Contenido de env.js:"
cat /app/src/assets/env.js

echo "🚀 Iniciando Angular dev server..."

# Ejecutar el comando original (ng serve)
exec "$@"