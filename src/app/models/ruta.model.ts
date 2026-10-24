/**
 * Modelo de datos para las rutas de navegación en CYLONS.
 * Representa un trayecto accesible hacia un destino en Calarcá (Quindío).
 */
export interface Ruta {
  id: string;
  nombreDestino: string;
  distanciaKm: number;
  tiempoEstimado: number;
  nivelAccesibilidad: 'alta' | 'media' | 'baja';
  descripcion?: string;
}
