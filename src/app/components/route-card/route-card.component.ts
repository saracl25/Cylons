import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ruta } from '../../models/ruta.model';

/**
 * Componente individual y reutilizable de tarjeta de ruta (RouteCard).
 * Representa una alternativa de desplazamiento hacia un destino.
 * Se comunica con su padre mediante input() y output().
 */
@Component({
  selector: 'app-route-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-card.component.html',
  styleUrls: ['./route-card.component.css']
})
export class RouteCardComponent {
  /**
   * Ruta asignada a la tarjeta (obligatoria).
   */
  public readonly ruta = input.required<Ruta>();

  /**
   * Indica si esta ruta es la que actualmente se encuentra seleccionada en la navegación activa.
   */
  public readonly activa = input<boolean>(false);

  /**
   * Emite la ruta cuando el usuario decide iniciar la guía interactiva hacia ella.
   */
  public readonly seleccionar = output<Ruta>();

  /**
   * Dispara la selección de la ruta notificando al componente contenedor.
   */
  public onIniciarGuia(): void {
    if (!this.activa()) {
      this.seleccionar.emit(this.ruta());
    }
  }
}
