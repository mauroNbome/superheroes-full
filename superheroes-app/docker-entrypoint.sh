#!/bin/sh

# ========================================
# SCRIPT DE INICIALIZACIÓN PARA ANGULAR EN DOCKER
# ========================================

echo "🚀 Inicializando aplicación Angular en Docker..."

# Crear archivo de configuración dinâmico con variables de entorno
cat > /usr/share/nginx/html/assets/env.js << EOF
/**
 * Configuración de variables de entorno generada por Docker
 * Generado automáticamente en: $(date)
 */

(function(window) {
  window.__env = window.__env || {};

  // Variables de entorno pasadas desde Docker Compose
  window.__env.apiUrl = '${API_URL:-http://localhost:3000}';
  window.__env.dockerEnv = ${DOCKER_ENV:-false};
  window.__env.environment = '${NODE_ENV:-development}';
  window.__env.debugMode = ${DEBUG_MODE:-false};
  
  // Información adicional
  window.__env.version = '${APP_VERSION:-1.0.0}';
  window.__env.buildDate = '$(date -u +"%Y-%m-%dT%H:%M:%SZ")';

  console.log('🔧 Variables de entorno cargadas:', window.__env);
})(this);
EOF

echo "✅ Archivo env.js generado con configuración:"
echo "   - API_URL: ${API_URL:-http://localhost:3000}"
echo "   - DOCKER_ENV: ${DOCKER_ENV:-false}"
echo "   - NODE_ENV: ${NODE_ENV:-development}"

# Mostrar el contenido del archivo para debug
echo "📄 Contenido de env.js:"
cat /usr/share/nginx/html/assets/env.js

echo "🌐 Iniciando nginx..."

# Ejecutar nginx
exec "$@"