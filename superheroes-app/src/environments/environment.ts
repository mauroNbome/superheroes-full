/**
 * Configuración de entorno para desarrollo
 * 
 * Este archivo es usado cuando se ejecuta `ng serve` o `ng build` 
 * sin especificar el flag --prod
 */

// Función para detectar el entorno automáticamente
function getApiUrl(): string {
  // 1. Si hay variable de entorno API_URL (Docker), usarla
  if ((window as any).__env && (window as any).__env.apiUrl) {
    return (window as any).__env.apiUrl;
  }
  
  // 2. Si estamos en Docker (detectado por hostname), usar nombre del servicio
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'http://backend-dev:3000';
  }
  
  // 3. Por defecto: desarrollo local
  return 'http://localhost:3000';
}

export const environment = {
  production: false,
  apiUrl: getApiUrl(),
  
  // Configuraciones adicionales
  appName: 'Superheroes App',
  version: '1.0.0',
  
  // Features flags
  enableLogging: true,
  enableDebugInfo: true,
  
  // Configuración de la API
  api: {
    timeout: 30000, // 30 segundos
    retries: 3,
  }
};

// Debug info para desarrollo
if (!environment.production) {
  console.log('🔧 Configuración de entorno (desarrollo):', {
    apiUrl: environment.apiUrl,
    hostname: window.location.hostname,
    dockerEnv: (window as any).__env?.dockerEnv || false
  });
}