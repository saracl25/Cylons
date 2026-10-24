import { Component, OnInit, OnDestroy, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario.model';

/**
 * Componente de barra superior de estado (StatusBar).
 * Muestra información del entorno simulada (reloj, nivel de batería, precisión GPS)
 * y el estado actual de la síntesis de voz (TTS).
 * Limpia sus temporizadores en ngOnDestroy para evitar fugas de memoria.
 */
@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.css']
})
export class StatusBarComponent implements OnInit, OnDestroy {
  /**
   * Estado de la guía por voz recibido del componente padre.
   */
  public readonly ttsActivo = input<boolean>(false);

  /**
   * Información del usuario asistido recibida del servicio/padre.
   */
  public readonly usuario = input<Usuario | null>(null);

  // --- Estados locales con Angular Signals ---
  public readonly horaActual = signal<string>('');
  public readonly nivelBateria = signal<number>(94);
  public readonly estadoGps = signal<string>('GPS: Calarcá (±2m)');

  private timerReloj: ReturnType<typeof setInterval> | null = null;
  private timerBateria: ReturnType<typeof setInterval> | null = null;

  public ngOnInit(): void {
    this.actualizarHora();
    // Actualizar reloj cada segundo
    this.timerReloj = setInterval(() => {
      this.actualizarHora();
    }, 1000);

    // Variación sutil de batería cada 45 segundos para realismo
    this.timerBateria = setInterval(() => {
      this.nivelBateria.update((b) => (b > 15 ? b - 1 : 98));
    }, 45000);
  }

  public ngOnDestroy(): void {
    if (this.timerReloj) {
      clearInterval(this.timerReloj);
      this.timerReloj = null;
    }
    if (this.timerBateria) {
      clearInterval(this.timerBateria);
      this.timerBateria = null;
    }
  }

  private actualizarHora(): void {
    const ahora = new Date();
    const formato = ahora.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    this.horaActual.set(formato);
  }
}
