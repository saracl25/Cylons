import { Ruta } from './ruta.model';
import { Alerta } from './alerta.model';
import { Usuario } from './usuario.model';

/**
 * Estructura raíz de los datos recibidos desde la fuente simulada externa (cylons-data.json).
 */
export interface CylonsData {
  usuario: Usuario;
  rutas: Ruta[];
  alertas: Alerta[];
}
