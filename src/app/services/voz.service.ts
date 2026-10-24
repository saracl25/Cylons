import { Injectable, signal } from '@angular/core';

/**
 * Servicio de síntesis de voz mediante la Web Speech API nativa.
 * Diseñado específicamente para accesibilidad (es-CO), local, gratuito y sin APIs de pago.
 */
@Injectable({
  providedIn: 'root'
})
export class VozService {
  public readonly isSpeaking = signal<boolean>(false);
  public readonly ultimoMensajeHablado = signal<string>('');
  public readonly sintetizadorDisponible = signal<boolean>(false);

  private synth: SpeechSynthesis | null = null;
  private vozSeleccionada: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.sintetizadorDisponible.set(true);
      this.cargarVoces();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.cargarVoces();
      }
    }
  }

  /**
   * Carga y prioriza voces en español latinoamericano / colombiano (es-CO, es-419, es-MX, es).
   */
  private cargarVoces(): void {
    if (!this.synth) return;
    const voces = this.synth.getVoices();
    if (voces.length === 0) return;

    // Prioridad 1: es-CO (Colombia)
    let vozCo = voces.find((v) => v.lang.toLowerCase() === 'es-co');
    // Prioridad 2: es-419 (Latinoamérica) o variantes hispanas
    if (!vozCo) {
      vozCo = voces.find((v) => v.lang.toLowerCase().startsWith('es'));
    }
    this.vozSeleccionada = vozCo || voces[0];
  }

  /**
   * Lee en voz alta un mensaje utilizando SpeechSynthesisUtterance.
   * Cancela la locución en curso si se especifica prioridad o para evitar solapamientos.
   */
  public hablar(texto: string, cancelarAnterior: boolean = true): void {
    if (!texto) return;
    this.ultimoMensajeHablado.set(texto);

    if (!this.synth) {
      // Fallback si la API no está disponible (ej. entorno de pruebas o navegador restringido)
      console.info(`[CYLONS TTS Simulador]: ${texto}`);
      return;
    }

    try {
      if (cancelarAnterior) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-CO';
      utterance.rate = 1.05; // Velocidad óptima para navegación
      utterance.pitch = 1.0;

      if (this.vozSeleccionada) {
        utterance.voice = this.vozSeleccionada;
      }

      utterance.onstart = () => {
        this.isSpeaking.set(true);
      };

      utterance.onend = () => {
        this.isSpeaking.set(false);
      };

      utterance.onerror = (e) => {
        // En algunos navegadores al cancelar intencionalmente se emite error 'interrupted' o 'canceled'
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('[CYLONS TTS] Notificación de evento:', e.error);
        }
        this.isSpeaking.set(false);
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[CYLONS TTS] Excepción al invocar síntesis de voz:', err);
      this.isSpeaking.set(false);
    }
  }

  /**
   * Detiene de inmediato cualquier lectura de voz en curso.
   */
  public detener(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Silencioso
      }
    }
    this.isSpeaking.set(false);
  }
}
