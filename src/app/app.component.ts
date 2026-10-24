import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CylonsService } from './services/cylons.service';
import { VozService } from './services/voz.service';
import { Ruta } from './models/ruta.model';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { RouteListComponent } from './components/route-list/route-list.component';
import { VoicePanelComponent } from './components/voice-panel/voice-panel.component';

/**
 * Componente Raíz de CYLONS (AppComponent).
 * Orquesta la carga inicial de datos desde CylonsService y gobierna los tres estados
 * principales de la aplicación:
 *   1) Estado de Carga (isLoading)
 *   2) Estado de Error (errorMessage) con opción de reintento
 *   3) Estado de Datos Listos (Layout principal con VoicePanel y RouteList)
 *
 * Mantiene la reactividad mediante Angular Signals locales para la ruta activa y el estado del sintetizador.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    StatusBarComponent,
    RouteListComponent,
    VoicePanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public readonly cylonsService = inject(CylonsService);
  public readonly vozService = inject(VozService);

  // --- Signals Locales de Estado de Navegación ---
  public readonly rutaActiva = signal<Ruta | null>(null);
  public readonly vozActiva = signal<boolean>(false);

  /**
   * Ciclo de vida: Inicia la petición HTTP al servicio para cargar el JSON simulado.
   */
  public ngOnInit(): void {
    this.cylonsService.cargarDatos();
  }

  /**
   * Reintenta la obtención de datos si ocurrió un fallo previo.
   */
  public reintentarCarga(): void {
    this.cylonsService.cargarDatos();
  }

  /**
   * Manejador del flujo de eventos ascendente:
   * RouteCard -> RouteList -> AppComponent.
   * Selecciona la ruta activa y activa la guía auditiva en tiempo real.
   */
  public onRutaSeleccionada(ruta: Ruta): void {
    this.rutaActiva.set(ruta);
    this.vozActiva.set(true);
    this.vozService.hablar(
      `Iniciando guía asistida hacia ${ruta.nombreDestino}. Distancia aproximada ${ruta.distanciaKm} kilómetros.`,
      true
    );
  }

  /**
   * Alterna la activación general del sintetizador de voz desde el panel.
   */
  public onVozToggle(activar: boolean): void {
    this.vozActiva.set(activar);
    if (!activar) {
      this.vozService.detener();
    }
  }

  /**
   * Reporta un nuevo obstáculo imprevisto en la vía mediante el servicio
   * y emite la alerta sonora inmediata para la persona con discapacidad visual.
   */
  public onReportarObstaculo(): void {
    const nuevaAlerta = this.cylonsService.reportarObstaculo();
    const mensajeVoz = `¡Atención! Obstáculo reportado: ${nuevaAlerta.tipoAlerta} detectado a ${nuevaAlerta.distanciaMetros} metros de distancia.`;
    this.vozService.hablar(mensajeVoz, true);
  }

  /**
   * Utilidad para demostración en vivo (Defensa oral):
   * Permite probar el manejo de error y el botón de Reintentar sin alterar el código fuente.
   */
  public toggleModoFalloDemo(): void {
    const esRutaInexistente = this.cylonsService.dataUrl.includes('inexistente');
    this.cylonsService.alternarUrlDemo(!esRutaInexistente);
  }
}
