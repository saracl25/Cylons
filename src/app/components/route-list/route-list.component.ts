import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ruta } from '../../models/ruta.model';
import { RouteCardComponent } from '../route-card/route-card.component';

/**
 * Componente contenedor (Padre) de la lista de rutas disponibles (RouteList).
 * Recibe la colección tipada, administra el renderizado con @for y delega
 * la selección de cada ruta hacia el componente raíz.
 */
@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [CommonModule, RouteCardComponent],
  templateUrl: './route-list.component.html',
  styleUrls: ['./route-list.component.css']
})
export class RouteListComponent {
  /**
   * Colección de rutas accesibles disponibles (obligatoria).
   */
  public readonly rutas = input.required<Ruta[]>();

  /**
   * Identificador único de la ruta que actualmente se encuentra activa en navegación.
   */
  public readonly rutaActivaId = input<string | null>(null);

  /**
   * Emite hacia el componente raíz (AppComponent) la ruta seleccionada por el usuario.
   */
  public readonly rutaSeleccionada = output<Ruta>();

  /**
   * Captura el evento emitido por una RouteCard hija y lo propaga hacia el padre.
   */
  public onRutaElegida(ruta: Ruta): void {
    this.rutaSeleccionada.emit(ruta);
  }
}
