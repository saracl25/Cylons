# CYLONS · Asistencia de Navegación Accesible para Personas con Discapacidad Visual

**Asignatura:** Desarrollo Web  
**Entregable:** Unidad 2 — Segunda Entrega: Tecnologías del lado del cliente (Front-End) — 20%  
**Integrantes:** Sara Cardona Lastra y Daniela Sucerquia Armesto  
**Docente:** Neider Xavier Vergara  
**Institución:** Corporación Universitaria Lasallista (Medellín / Caldas, Antioquia)  
**Tecnología:** Angular 18+ (Angular 21), TypeScript estricto, Angular Signals, Web Speech API nativa (es-CO)  

---

## 1. Cómo Ejecutar el Proyecto

### Prerrequisitos
- Node.js 18+ o superior (recomendado Node 20 o 22).
- npm 10+.

### Pasos de ejecución
```bash
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Iniciar el servidor de desarrollo local
npm start
# o alternativamente:
npx ng serve

# 3. Abrir en el navegador
# http://localhost:4200
```

### Compilación para Producción
```bash
npm run build
# Compila con cero errores y genera el bundle optimizado en /dist/cylons
```

---

## 2. Flujo de Datos Arquitectónico

La solución implementa la separación estricta de responsabilidades exigida:

```
[ public/assets/data/cylons-data.json ]   <-- Fuente de datos externa simulada
                  │
                  ▼ (HttpClient.get + delay(900) + catchError)
        [ CylonsService ]                <-- Capa de servicios y estado reactivo global
                  │
                  ▼ (Angular Signals: rutas, alertas, usuario, isLoading, errorMessage)
         [ AppComponent ]                <-- Orquestador raíz (gobierna los 3 estados con @if)
           │            │
           │ (input)    │ (input)
           ▼            ▼
  [ VoicePanel ]    [ RouteList ]        <-- Componentes especializados
                        │
                        ▼ (input / output)
                  [ RouteCard ]          <-- Componente individual reutilizable
```

---

## 3. Mapeo de Requisitos de la Rúbrica

| Requisito de la Rúbrica | Archivo(s) donde se evidencia | Explicación Técnica |
| :--- | :--- | :--- |
| **1. Implementación en Angular** | `src/app/`, `package.json` | Proyecto Angular moderno con componentes *standalone*, control de flujo (`@if`, `@for`, `track`) y TypeScript en modo estricto. |
| **2. Modelo de datos tipado** | `src/app/models/*.model.ts` | Modelos `Ruta`, `Alerta`, `Usuario` y `CylonsData` con *union types* (`'alta' \| 'media' \| 'baja'`, `'peatón' \| 'obra' \| 'escalón'`). |
| **3. Fuente de datos externa** | `public/assets/data/cylons-data.json` | JSON desacoplado con 5 rutas y 5 alertas reales en Envigado / Colombia (usuario: Daniela Sucerquia). Sin colecciones quemadas. |
| **4. Servicio con HttpClient** | `src/app/services/cylons.service.ts` | Servicio `@Injectable({ providedIn: 'root' })` con `inject(HttpClient)`, `delay(900)`, `tap`, `catchError` y `finalize`. |
| **5. Manejo de estado con Signals** | `cylons.service.ts`, `app.component.ts` | Señales reactivas: `rutas`, `alertas`, `usuario`, `isLoading`, `errorMessage`, `rutaActiva` y `vozActiva`. |
| **6. Componentización (Padre / Hijo)** | `route-list/`, `route-card/` | `RouteList` (Padre) itera con `@for` y recibe `RouteCard` (Hijo) mediante comunicación desacoplada `input()` y `output()`. |
| **7. Renderizado dinámico y 3 estados** | `src/app/app.component.html` | Estado 1: Carga con Spinner; Estado 2: Error con Reintento; Estado 3: Aplicación lista con layout de 2 columnas. |
| **8. Interacciones significativas** | `voice-panel/`, `voz.service.ts` | 1) "Activar guía por voz": cicla instrucciones audibles con Web Speech API (`es-CO`) y barra de progreso. 2) "Reportar obstáculo": agrega alertas inmutables y las reordena por cercanía métrica. |
| **9. Diseño Responsive Mobile-First** | `src/styles.css`, `app.component.css` | 1 columna en móvil (375px) y 2 columnas con panel *sticky* en escritorio (≥960px y 1440px). Botones ≥48px y contraste WCAG AAA. |
| **10. Organización del código** | Estructura en `models/`, `services/`, `components/` | Separación limpia de responsabilidades con documentación en español. |

---

## 4. Truco para Demostración en Vivo (Defensa Oral)

Para demostrar en vivo la resiliencia de la aplicación y el botón **"Reintentar conexión"**:

### Opción A (Desde la Interfaz):
1. En el pie de página de la aplicación, haga clic en el botón:
   `🛠️ Demo: Simular fallo de red (404/Error)`.
2. La aplicación simulará de inmediato un fallo de red, mostrando el contenedor de error ámbar con el mensaje de diagnóstico y el botón **"Reintentar conexión"**.
3. Pulse **"Restaurar fuente de datos original"** o vuelva a pulsar el botón para recuperar el funcionamiento normal.

### Opción B (Desde el Código):
En el archivo `src/app/services/cylons.service.ts`, cambie temporalmente la línea 22:
```typescript
public dataUrl = 'assets/data/inexistente.json';
```
Guarde el archivo y el servidor de desarrollo recargará mostrando la pantalla de error y el botón de reintento.
