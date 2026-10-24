import {
  Component,
  OnInit,
  OnDestroy,
  input,
  output,
  computed,
  signal,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ruta } from '../../models/ruta.model';
import { Alerta } from '../../models/alerta.model';
import { VozService } from '../../services/voz.service';

/**
 * Interfaz para representar un paso instruccional del trayecto.
 */
export interface PasoInstruccion {
  numero: number;
  texto: string;
  distanciaMetros: number;
  tipoAccion: 'avanzar' | 'girar' | 'cruzar' | 'llegada';
}

/**
 * Componente interactivo del Panel de Navegación por Voz (VoicePanel).
 * Governa la síntesis de voz Web Speech API, el ciclado de pasos con effect + interval,
 * el ordenamiento reactivo de alertas y el reporte de obstáculos inmediatos.
 */
@Component({
  selector: 'app-voice-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-panel.component.html',
  styleUrls: ['./voice-panel.component.css']
})
export class VoicePanelComponent implements OnInit, OnDestroy {
  public readonly vozService = inject(VozService);

  // --- Inputs obligatorios y de estado ---
  public readonly rutaActiva = input<Ruta | null>(null);
  public readonly alertas = input<Alerta[]>([]);
  public readonly vozActiva = input<boolean>(false);

  // --- Outputs para comunicación ascendente ---
  public readonly vozToggle = output<boolean>();
  public readonly reportar = output<void>();

  // --- Estado local de navegación ---
  public readonly indicePasoActual = signal<number>(0);
  private intervaloCiclo: ReturnType<typeof setInterval> | null = null;

  /**
   * Generación reactiva de instrucciones paso a paso con computed().
   * Se recalculan de forma dinámica cada vez que cambia la ruta activa.
   */
  public readonly instrucciones = computed<PasoInstruccion[]>(() => {
    const ruta = this.rutaActiva();
    if (!ruta) {
      return [
        {
          numero: 1,
          texto: 'Seleccione un destino en la lista de rutas para activar la navegación asistida paso a paso.',
          distanciaMetros: 0,
          tipoAccion: 'avanzar'
        }
      ];
    }

    return [
      {
        numero: 1,
        texto: `Inicie el recorrido en dirección al ${ruta.nombreDestino}. Mantenga el bastón sobre la franja podotáctil de la derecha.`,
        distanciaMetros: 50,
        tipoAccion: 'avanzar'
      },
      {
        numero: 2,
        texto: `En 80 metros encontrará un cruce semaforizado con señal acústica. Espere el tono agudo para cruzar la Carrera 24.`,
        distanciaMetros: 80,
        tipoAccion: 'cruzar'
      },
      {
        numero: 3,
        texto: `Gire a la izquierda 90 grados hacia el andén protegido. El sendero está libre de escalones abruptos.`,
        distanciaMetros: 120,
        tipoAccion: 'girar'
      },
      {
        numero: 4,
        texto: `Continúe en línea recta 150 metros. Andén nivelado con buena guía de fachada continua.`,
        distanciaMetros: 150,
        tipoAccion: 'avanzar'
      },
      {
        numero: 5,
        texto: `Ha llegado a su destino: ${ruta.nombreDestino}. Entrada principal accesible al frente con rampa de bajo peralte.`,
        distanciaMetros: 20,
        tipoAccion: 'llegada'
      }
    ];
  });

  /**
   * Paso actual en curso derivado de forma reactiva.
   */
  public readonly pasoActual = computed<PasoInstruccion>(() => {
    const lista = this.instrucciones();
    const indice = this.indicePasoActual();
    return lista[indice] || lista[0];
  });

  /**
   * Cálculo del porcentaje de progreso de la ruta (0% a 100%).
   */
  public readonly porcentajeProgreso = computed<number>(() => {
    const total = this.instrucciones().length;
    if (total <= 1) return 0;
    const indice = this.indicePasoActual();
    return Math.round(((indice + 1) / total) * 100);
  });

  /**
   * Colección de alertas reordenada reactivamente por distancia ascendente
   * (las más próximas y riesgosas primero) mediante un computed().
   */
  public readonly alertasOrdenadas = computed<Alerta[]>(() => {
    const lista = this.alertas();
    return [...lista].sort((a, b) => a.distanciaMetros - b.distanciaMetros);
  });

  constructor() {
    // Reacción reactiva ante cambios en vozActiva o en la rutaActiva
    effect(() => {
      const estaActiva = this.vozActiva();
      const ruta = this.rutaActiva();

      if (estaActiva && ruta) {
        this.iniciarCicloVoz();
      } else {
        this.detenerCicloVoz();
      }
    });
  }

  public ngOnInit(): void {
    // Inicialización del componente
  }

  public ngOnDestroy(): void {
    this.detenerCicloVoz();
  }

  /**
   * Inicia el ciclo automático de instrucciones por voz con intervalo temporal.
   */
  private iniciarCicloVoz(): void {
    this.detenerCicloVoz();

    // Locución inicial del paso actual
    const pasoInicial = this.pasoActual();
    this.vozService.hablar(pasoInicial.texto, true);

    // Cada 7 segundos simula el avance del usuario hacia el siguiente punto de referencia
    this.intervaloCiclo = setInterval(() => {
      const total = this.instrucciones().length;
      if (total === 0) return;

      const siguienteIndice = (this.indicePasoActual() + 1) % total;
      this.indicePasoActual.set(siguienteIndice);

      const paso = this.pasoActual();
      this.vozService.hablar(paso.texto, true);
    }, 7000);
  }

  /**
   * Detiene el intervalo del ciclo de voz y silencia el sintetizador.
   */
  private detenerCicloVoz(): void {
    if (this.intervaloCiclo) {
      clearInterval(this.intervaloCiclo);
      this.intervaloCiclo = null;
    }
    this.vozService.detener();
  }

  /**
   * Alterna el estado de activación de la voz y emite el nuevo valor hacia el padre.
   */
  public onToggleVoz(): void {
    const nuevoEstado = !this.vozActiva();
    this.vozToggle.emit(nuevoEstado);
  }

  /**
   * Avanza manualmente al siguiente paso de la guía.
   */
  public pasoSiguiente(): void {
    const total = this.instrucciones().length;
    if (total === 0) return;
    const sig = (this.indicePasoActual() + 1) % total;
    this.indicePasoActual.set(sig);
    if (this.vozActiva()) {
      this.vozService.hablar(this.pasoActual().texto, true);
    }
  }

  /**
   * Retrocede manualmente al paso anterior de la guía.
   */
  public pasoAnterior(): void {
    const total = this.instrucciones().length;
    if (total === 0) return;
    const prev = (this.indicePasoActual() - 1 + total) % total;
    this.indicePasoActual.set(prev);
    if (this.vozActiva()) {
      this.vozService.hablar(this.pasoActual().texto, true);
    }
  }

  /**
   * Emite el evento de reporte de obstáculo hacia el componente padre/servicio.
   */
  public onReportarObstaculo(): void {
    this.reportar.emit();
  }
}
