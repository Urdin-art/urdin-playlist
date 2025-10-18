# Plan de Refactorización del Sistema de Temas v2

Este documento describe la planificación y los detalles técnicos para la refactorización completa del sistema de temas de la aplicación.

## 1. Objetivos

- Reorganizar y ampliar las opciones de personalización del tema.
- Crear una jerarquía de configuración "Simple" y "Completa" para facilitar la edición.
- Renombrar las variables CSS para que sean más semánticas y claras.
- Aplicar el nuevo sistema de temas a toda la aplicación, incluyendo el panel de administración y los modales.

## 2. Nueva Estructura de Datos (theme-*.json)

El archivo JSON de cada tema se dividirá en dos objetos principales: `simple` y `complete`.

- `simple`: Contiene colores base para una configuración rápida. Estos valores no se aplican directamente, sino que sirven para calcular los valores de la configuración `complete`.
- `complete`: Contiene todas las opciones de personalización detalladas que se traducirán directamente a variables CSS.

```json
{
  "simple": {
    "primary": "hsla(280, 70%, 60%, 1)",
    "secondary": "hsla(320, 60%, 50%, 1)",
    "accent": "hsla(200, 80%, 60%, 1)",
    "cardBackground": "hsla(280, 30%, 15%, 1)",
    "pageBackground": "hsla(280, 50%, 10%, 1)"
  },
  "complete": {
    "navigation": {
      "backgroundGradient": {
        "from": "rgba(28, 10, 40, 0.8)",
        "to": "rgba(40, 10, 30, 0.8)",
        "type": "linear",
        "angle": 135
      },
      "borderColor": "rgba(120, 80, 150, 0.5)",
      "borderWidth": "1px",
      "separatorColor": "rgba(120, 80, 150, 0.3)",
      "hoverMenuColor": "rgba(200, 150, 220, 0.1)",
      "hoverItemColor": "rgba(200, 150, 220, 0.2)",
      "textColor": "rgba(230, 220, 240, 1)",
      "hoverTextColor": "rgba(255, 255, 255, 1)"
    },
    "buttons": {
      "inactive": {
        "backgroundGradient": {"from": "...", "to": "..."},
        "borderColor": "...",
        "iconColor": "...",
        "glowColor": "..."
      },
      "hover": {
        "backgroundGradient": {"from": "...", "to": "..."},
        "borderColor": "...",
        "iconColor": "...",
        "glowColor": "..."
      },
      "active": {
        "backgroundGradient": {"from-active": "...", "to-active": "..."},
        "borderColor": "...",
        "iconColor": "...",
        "glowColor": "..."
      },
      "glowSize": "15px"
    },
    "backgrounds": {
      "page": { "from": "...", "to": "...", "type": "linear", "angle": 135 },
      "albumArtCard": { "from": "...", "to": "...", "type": "linear", "angle": 135 },
      "playerCard": { "from": "...", "to": "...", "type": "linear", "angle": 135 },
      "playlistCard": { "from": "...", "to": "...", "type": "linear", "angle": 135 },
      "exclusionsCard": { "from": "...", "to": "...", "type": "linear", "angle": 135 }
    },
    "text": {
      "headerFooter": {
        "normal": "...",
        "highlighted": "..."
      },
      "player": {
        "title": "...",
        "artist": "...",
        "album": "...",
        "timestamp": "..."
      },
      "playlist": {
        "title": "...",
        "secondary": "...",
        "icons": "..."
      }
    },
    "lyricsCard": {
      "background": "...",
      "scanlines": "...",
      "textHighlighted": "...",
      "textDimmed": "...",
      "glowColor": "...",
      "glowSize": "...",
      "borderColor": "...",
      "borderWidth": "...",
      "borderRadius": "..."
    },
    "borders": {
      "menu": { "color": "...", "width": "...", "radius": "..." },
      "albumArtCard": { "color": "...", "width": "...", "radius": "..." },
      "playerCard": { "color": "...", "width": "...", "radius": "..." },
      "playlistCard": { "color": "...", "width": "...", "radius": "..." },
      "playlistItem": { "color": "...", "width": "...", "radius": "..." },
      "exclusionsCard": { "color": "...", "width": "...", "radius": "..." }
    },
    "glows": {
        "menu": { "color": "...", "size": "..." },
        "albumArtCard": { "color": "...", "size": '...'},
        "playerCard": { "color": "...", "size": '...'},
        "playlistCard": { "color": "...", "size": '...'},
        "playlistItem": { "color": "...", "size": '...'},
        "exclusionsCard": { "color": "...", "size": '...'}    
    }
  }
}
```

## 3. Plan de Implementación

1.  **Paso 1: Migración de Datos**
    -   Leer cada `theme-*.json` existente.
    -   Crear una nueva estructura en memoria con los apartados `simple` y `complete`.
    -   Rellenar `simple` con los valores HUE antiguos convertidos a HSLA.
    -   Rellenar `complete` con valores por defecto derivados de la configuración `simple`.
    -   Sobrescribir los archivos `theme-*.json` con la nueva estructura.

2.  **Paso 2: Rediseño del Editor de Temas (`ThemeEditor.tsx`)**
    -   Actualizar el tipo de datos que maneja el editor.
    -   Construir el formulario con dos secciones: "Configuración simple" y "Configuración completa" (inicialmente colapsada).
    -   Implementar la lógica de actualización: al cambiar un color en "simple", se recalculan y actualizan los campos correspondientes en "completa".
    -   Usar inputs de texto para los colores para permitir el formato `rgba(r, g, b, a)`.

3.  **Paso 3: Punto de Control y Pruebas**
    -   En este punto, el backend y el editor de temas estarán listos.
    -   La aplicación principal se verá rota, pero el panel de administración será funcional para crear, editar y guardar los nuevos temas.
    -   **PAUSA para que el usuario pueda probar el nuevo editor.**

4.  **Paso 4: Actualización del Motor de Temas (`useAppConfig.ts`)**
    -   Modificar `applyThemeColors` para que reciba el objeto `complete`.
    -   Implementar una función recursiva que aplane el objeto JSON `complete` y lo convierta en variables CSS con un formato claro (ej: `--nav-bg-gradient-from`).

5.  **Paso 5: Aplicación Global de Estilos**
    -   Revisar y reemplazar las variables CSS antiguas por las nuevas en todos los archivos `.tsx` y `.css`.
    -   Esto incluye componentes, páginas, estilos globales, etc.
    -   Adaptar el estilo del panel de administración para que también consuma las nuevas variables de tema.
