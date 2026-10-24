import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, tap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Ruta } from '../models/ruta.model';
import { Alerta } from '../models/alerta.model';
import { Usuario } from '../models/usuario.model';
import { CylonsData } from '../models/cylons-data.model';

/**
 * Servicio principal de gestión de datos para CYLONS.
 * Administra el estado global de rutas, alertas y usuario mediante Angular Signals.
 * Implementa la separación estricta: Fuente externa -> Servicio -> Componente -> Estado -> Interfaz.
 */
@Injectable({
  providedIn: 'root'
})
export class CylonsService {
  private readonly http = inject(HttpClient);

  /**
   * Ruta relativa de los datos simulados en formato JSON.
   * Para demostración en vivo de error, se puede cambiar a 'assets/data/inexistente.json'.
   */
  public dataUrl = 'assets/data/cylons-data.json';

  // --- Estado Global con Angular Signals ---
  public readonly rutas = signal<Ruta[]>([]);
  public readonly alertas = signal<Alerta[]>([]);
  public readonly usuario = signal<Usuario | null>(null);
  public readonly isLoading = signal<boolean>(true);
  public readonly errorMessage = signal<string | null>(null);

  /**
   * Carga los datos del archivo JSON externo con simulación de latencia de red (900ms).
   * Alimenta las señales de estado y gestiona los estados de carga y error.
   */
  public cargarDatos(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.get<CylonsData>(this.dataUrl).pipe(
      delay(900), // Latencia perceptible para apreciar el estado de carga y accesibilidad
      tap((data: CylonsData) => {
        if (!data || !data.rutas || !data.alertas) {
          throw new Error('Estructura de datos inválida recibida desde la fuente JSON.');
        }
        this.rutas.set(data.rutas);
        this.alertas.set(data.alertas);
        this.usuario.set(data.usuario);
        this.errorMessage.set(null);
      }),
      catchError((error: unknown) => {
        const errorDetalle = error instanceof Error ? error.message : 'Error de conexión HTTP';
        const mensajeLegible = `No fue posible conectar con el servidor de rutas (${this.dataUrl}). Verifique la conexión o la fuente de datos. Detalle: ${errorDetalle}`;
        this.errorMessage.set(mensajeLegible);
        return of(null);
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe();
  }

  /**
   * Genera de forma aleatoria un obstáculo detectado en la vía y lo inserta
   * inmutablemente en la cabecera de la señal de alertas.
   * @returns La nueva alerta generada para ser anunciada por el sintetizador de voz.
   */
  public reportarObstaculo(): Alerta {
    const tipos: Array<'peatón' | 'obra' | 'escalón'> = ['peatón', 'obra', 'escalón'];
    const severidades: Array<'baja' | 'media' | 'alta'> = ['baja', 'media', 'alta'];
    const ubicacionesReferencia = [
      'Andén oriental frente a panadería',
      'Cruce de peatones con Calle 39',
      'Esquina de la Carrera 24 sin rebaje',
      'Acceso peatonal próximo a la parada de bus',
      'Zona de andén con franja podotáctil obstruida',
      'Inmediaciones del parque Bolívar'
    ];

    const tipoSeleccionado = tipos[Math.floor(Math.random() * tipos.length)];
    const severidadSeleccionada = severidades[Math.floor(Math.random() * severidades.length)];
    const distanciaAleatoria = Math.floor(Math.random() * 45) + 3; // Entre 3 y 48 metros
    const ubicacionAleatoria = ubicacionesReferencia[Math.floor(Math.random() * ubicacionesReferencia.length)];

    const nuevaAlerta: Alerta = {
      id: `alt-${Date.now()}`,
      tipoAlerta: tipoSeleccionado,
      distanciaMetros: distanciaAleatoria,
      severidad: severidadSeleccionada,
      ubicacion: ubicacionAleatoria
    };

    // Actualización reactiva e inmutable de la señal
    this.alertas.update((listaActual) => [nuevaAlerta, ...listaActual]);

    return nuevaAlerta;
  }

  /**
   * Método de utilidad para demostración: permite alternar entre la URL correcta
   * y una URL inexistente para forzar el estado de error y verificar el botón "Reintentar".
   */
  public alternarUrlDemo(forzarError: boolean): void {
    this.dataUrl = forzarError ? 'assets/data/inexistente.json' : 'assets/data/cylons-data.json';
    this.cargarDatos();
  }
}
