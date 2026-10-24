/**
 * Modelo de datos para las alertas y obstáculos detectados en el entorno.
 * Soporta tipos específicos y niveles de severidad para navegación asistida.
 */
export interface Alerta {
  id: string;
  tipoAlerta: 'peatón' | 'obra' | 'escalón';
  distanciaMetros: number;
  severidad: 'baja' | 'media' | 'alta';
  ubicacion?: string;
}
