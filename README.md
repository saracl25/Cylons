# CYLONS
### Softbot de asistencia a la navegación para personas con discapacidad visual

**Segunda entrega · Unidad 2: Tecnologías del lado del cliente (Front-End)**

## 1. Sobre el proyecto

**CYLONS** es un softbot de asistencia a la navegación diseñado para personas con discapacidad visual. Simula cómo una usuaria con baja visión descubre rutas seguras cerca de su posición, recibe alertas sobre obstáculos y obtiene una guía por voz paso a paso generada directamente en el navegador.

La interfaz está diseñada para facilitar la navegación sin necesidad de ver la pantalla, mediante contraste extremo, tipografía de alta legibilidad, foco visible y controles de gran tamaño.

El proyecto fue desarrollado con **Angular CLI 21.2** y utiliza componentes standalone, modelos tipados en TypeScript, union types, control de flujo moderno con `@if` y `@for`, estado reactivo con Angular Signals y comunicación entre componentes mediante `input()` y `output()`.

La aplicación no requiere un back-end propio. Los datos provienen de un archivo JSON externo consumido mediante `HttpClient`, lo que permite reemplazar posteriormente esta fuente por una API REST sin modificar la interfaz.


## 2. Características principales

### Guía por voz

- Síntesis de voz en español mediante la Web Speech API.
- Lectura de instrucciones directamente en el navegador, sin servicios de voz pagos.
- Visualización del destino activo, paso actual y porcentaje de progreso.
- Barra de progreso y navegación mediante los botones **Anterior** y **Siguiente**.
- Activación y desactivación de la guía por voz.

### Catálogo de rutas accesibles

Incluye cinco rutas de demostración en Envigado:

- Casa en el barrio La Magnolia.
- Parque Principal de Envigado.
- Universidad Lasallista.
- Fundación Aliada.
- Terminal de Transportes.

Cada ruta presenta su distancia, tiempo estimado y nivel de accesibilidad mediante indicadores visuales: **ALTA, MEDIA o BAJA**. La ruta activa muestra el botón «En curso» deshabilitado.

### Alertas de obstáculos

- Identificación de obstáculos simulados, como peatones, obras y escalones.
- Ordenamiento automático de las alertas según la distancia mediante `computed()`.
- Registro de nuevos obstáculos mediante la opción **Reportar obstáculo**.
- Actualización inmutable del estado mediante `signal.update()`.
- Anuncio por voz de las nuevas alertas.

### Barra de estado

Presenta información simulada sobre el perfil de la usuaria, el estado de la guía por voz, la ubicación GPS en Envigado, la batería y la hora actual.

El estado reactivo se gestiona con Signals e intervalos que se liberan durante `ngOnDestroy`.

### Estados de la interfaz

La aplicación contempla tres estados principales mediante `@if`:

1. **Carga:** muestra un indicador visual mientras se solicitan los datos.
2. **Error:** presenta un mensaje comprensible y un botón para reintentar.
3. **Contenido:** muestra las rutas, las alertas y los controles de asistencia.

### Diseño responsive y accesible

- Enfoque *mobile-first*.
- Una columna en dispositivos móviles y dos columnas en pantallas de mayor tamaño.
- Panel de voz fijo (*sticky*) a partir de los 960 px.
- Pruebas visuales realizadas a 375 px y 1440 px.
- Alto contraste, tipografía Atkinson Hyperlegible y foco visible.
- Botones de al menos 48 px de alto.
- Roles ARIA, incluidos `role="status"` y `role="alert"`.

## 3. Stack tecnológico

| Tecnología | Uso en el proyecto |
|---|---|
| Angular 21.2 | Framework para construir la aplicación SPA con componentes standalone. |
| Angular Signals | Gestión del estado reactivo con `signal`, `computed` y `effect`. |
| TypeScript | Modelos tipados, union types y código en modo estricto. |
| RxJS | Manejo del flujo asíncrono mediante `delay`, `tap`, `catchError` y `finalize`. |
| HttpClient | Consumo de los datos del archivo JSON externo. |
| Web Speech API | Síntesis de voz para las instrucciones de navegación. |
| Vitest | Ejecución de pruebas unitarias. |
| CSS propio | Diseño responsive, contraste, foco visible y controles accesibles. |

## 4. Requisitos previos

Antes de ejecutar el proyecto, se recomienda contar con:

- Node.js 20.19+, 22.12+ o 24 LTS.
- npm 10 o superior.
- Un navegador compatible con la síntesis de voz, como Google Chrome o Microsoft Edge.

Si el navegador no admite la síntesis de voz, la aplicación continúa siendo funcional visualmente.


## 5. Arquitectura de la solución

La arquitectura utiliza un flujo de datos unidireccional que separa la fuente de información de los componentes visuales.

```text
JSON externo
    ↓
CylonsService
(HttpClient + manejo de errores)
    ↓
Estado global con Angular Signals
(rutas, alertas, usuaria, carga y error)
    ↓
AppComponent
(orquestación de los estados de la interfaz)
    ↓
Componentes independientes
    ↓
Plantillas Angular
(@if, @for, interpolación y eventos)
```

La fuente de datos se encuentra en:

```text
public/assets/data/cylons-data.json
```

El servicio `CylonsService` centraliza la lectura del JSON y la gestión del estado. Los componentes reciben la información mediante sus entradas y comunican las acciones mediante eventos, sin depender directamente del origen de los datos.

Esta separación facilita sustituir el archivo JSON por una API REST en futuras entregas.

## 5. Estructura del proyecto

```text
cylons/
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── public/
│   └── assets/
│       └── data/
│           └── cylons-data.json
├── docs/
│   ├── INFORME.md
│   └── evidencias/
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.css
    └── app/
        ├── models/
        │   ├── ruta.model.ts
        │   ├── alerta.model.ts
        │   ├── usuario.model.ts
        │   └── cylons-data.model.ts
        ├── services/
        │   ├── cylons.service.ts
        │   └── voz.service.ts
        ├── components/
        │   ├── status-bar/
        │   ├── voice-panel/
        │   ├── route-list/
        │   └── route-card/
        ├── app.component.*
        └── app.config.ts
```

## 6. Modelos de datos

| Modelo | Campos principales |
|---|---|
| `Usuario` | `nombre`, `nivelAsistencia`, `ciudad`. |
| `Ruta` | `id`, `nombreDestino`, `distanciaKm`, `tiempoEstimado`, `nivelAccesibilidad`, `descripcion`. |
| `Alerta` | `id`, `tipoAlerta`, `distanciaMetros`, `severidad`, `ubicacion`. |
| `CylonsData` | `usuario`, `rutas[]`, `alertas[]`. |

Los modelos utilizan tipos explícitos y union types para restringir los valores permitidos. Por ejemplo:

- Nivel de accesibilidad: `'alta' | 'media' | 'baja'`.
- Tipo de alerta: `'peatón' | 'obra' | 'escalón'`.
- Severidad: `'baja' | 'media' | 'alta'`.

## 7. Comunicación entre componentes

La comunicación entre componentes se implementa mediante las funciones modernas `input()` y `output()`.

| Componente | Entradas | Salidas |
|---|---|---|
| `RouteCardComponent` | `ruta`, `activa` | `seleccionar` |
| `RouteListComponent` | `rutas`, `rutaActivaId` | `rutaSeleccionada` |
| `VoicePanelComponent` | `rutaActiva`, `alertas`, `vozActiva` | `vozToggle`, `reportar` |

Ejemplo de la comunicación entre el componente hijo y el componente padre:

```typescript
ruta = input.required<Ruta>();
activa = input<boolean>(false);
seleccionar = output<Ruta>();
```

La lista de rutas renderiza las tarjetas mediante `@for` y propaga los eventos de selección al componente superior.

```html
<app-route-card
  [ruta]="ruta"
  [activa]="ruta.id === rutaActivaId()"
  (seleccionar)="rutaSeleccionada.emit($event)"
/>
```

El flujo de selección es:

```text
RouteCardComponent
        ↓
RouteListComponent
        ↓
AppComponent
```

El componente raíz mantiene el estado de la ruta activa y coordina la interacción con la guía por voz.

## 12. Estado global con Angular Signals

El servicio `CylonsService` centraliza las señales principales:

| Señal | Tipo | Descripción |
|---|---|---|
| `rutas` | `Ruta[]` | Rutas obtenidas del JSON. |
| `alertas` | `Alerta[]` | Obstáculos registrados. |
| `usuario` | `Usuario \| null` | Información del perfil. |
| `isLoading` | `boolean` | Indica si la petición está en curso. |
| `errorMessage` | `string \| null` | Mensaje de error legible. |

El método `cargarDatos()` utiliza operadores de RxJS para controlar la petición:

- `delay(900)`: permite visualizar el estado de carga durante la demostración.
- `tap`: actualiza las señales cuando se reciben los datos.
- `catchError`: gestiona los errores de carga.
- `finalize`: finaliza el estado de carga independientemente del resultado.

El método `reportarObstaculo()` agrega una alerta sin modificar directamente la lista anterior:

```typescript
alertas.update(lista => [nueva, ...lista]);
```

El ordenamiento por distancia se calcula mediante `computed()`, manteniendo la información reactiva.
