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


public dataUrl = 'assets/data/inexistente.json';
```
Guarde el archivo y el servidor de desarrollo recargará mostrando la pantalla de error y el botón de reintento.
