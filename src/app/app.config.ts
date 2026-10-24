import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';

/**
 * Configuración global de la aplicación Angular CYLONS.
 * Provee HttpClient con API fetch moderna y listeners globales.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch())
  ]
};
