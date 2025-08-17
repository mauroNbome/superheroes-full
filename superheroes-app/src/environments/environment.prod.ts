/**
 * Configuración de entorno para producción
 * 
 * Este archivo es usado cuando se ejecuta `ng build --prod`
 */

// Función para detectar el entorno automáticamente en producción
function getApiUrl(): string {
  // 1. Si hay variable de entorno API_URL (Docker), usarla
  if ((window as any).__env && (window as any).__env.apiUrl) {
    return (window as any).__env.apiUrl;
  }
  
  // 2. Si estamos en Docker, usar nombre del servicio
  if ((window as any).__env && (window as any).__env.dockerEnv) {
    return 'http://backend:3000';
  }
  
  // 3. Producción en servidor web normal
  // Asume que la API está en el mismo dominio con ruta /api
  return `${window.location.protocol}//${window.location.host}/api`;
}

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
  
  // Configuraciones adicionales
  appName: 'Superheroes App',
  version: '1.0.0',
  
  // Features flags (deshabilitados en producción)
  enableLogging: false,
  enableDebugInfo: false,
  
  // Configuración de la API
  api: {
    timeout: 15000, // 15 segundos (más restrictivo en producción)
    retries: 2,
  }
};

// Solo mostrar info en desarrollo
if (!environment.production && (window as any).__env?.debugMode) {
  console.log('🚀 Configuración de entorno (producción):', {
    apiUrl: environment.apiUrl,
    hostname: window.location.hostname,
    dockerEnv: (window as any).__env?.dockerEnv || false
  });
}