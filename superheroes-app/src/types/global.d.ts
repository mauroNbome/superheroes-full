/**
 * Definiciones de tipos globales para la aplicación
 */

// Extender el objeto Window para incluir variables de entorno
declare global {
  interface Window {
    __env?: {
      apiUrl?: string;
      dockerEnv?: boolean | string;
      environment?: string;
      debugMode?: boolean;
      version?: string;
      buildDate?: string;
    };
  }
}

// Esto es necesario para que TypeScript trate este archivo como un módulo
export {};