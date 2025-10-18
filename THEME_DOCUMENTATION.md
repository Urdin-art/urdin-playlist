# Documentación del Sistema de Temas - Retro Beat Player

Este documento detalla cómo funciona el sistema de temas de la aplicación, mapeando las opciones de configuración del archivo JSON a las variables CSS y los componentes que las utilizan.

## 1. Flujo de Datos del Tema

1.  **Archivo de Configuración JSON**: La configuración del tema se define en un archivo JSON (p. ej., `public/A-side.json`). Este archivo contiene un objeto `colors` con todas las opciones de personalización.
2.  **Hook `useAppConfig.ts`**: Este hook de React (`src/hooks/useAppConfig.ts`) se encarga de:
    *   Cargar el archivo JSON de configuración correspondiente.
    *   Llamar a la función `applyThemeColors` para procesar las opciones de color.
3.  **Función `applyThemeColors`**: Esta función toma el objeto `colors` y lo utiliza para establecer una serie de **variables CSS personalizadas (custom properties)** en el elemento `:root` del DOM. Esto hace que las variables estén disponibles globalmente en toda la aplicación.
4.  **Archivos CSS**: Los archivos CSS (`src/index.css` y otros) utilizan estas variables CSS (p. ej., `var(--primary)`) para aplicar los estilos a los elementos y componentes de la interfaz de usuario.

## 2. Mapeo de Opciones del Tema

A continuación se detalla cada propiedad del objeto `colors` en el JSON, la variable CSS que genera y dónde se aplica.

### 2.1. Colores Principales (HUE)

Estas propiedades definen los valores de matiz (HUE) para los colores principales. El resto de las propiedades (saturación, luminosidad) se definen directamente en el CSS para mayor flexibilidad.

| Propiedad JSON | Variable CSS (`:root`) | Descripción y Uso |
| :--- | :--- | :--- |
| `primary` | `--primary-h` | Matiz del color primario. Se usa para bordes, sombras, botones y textos con gradiente. |
| `secondary` | `--secondary-h` | Matiz del color secundario. Se usa para botones, sombras y textos con gradiente. |
| `accent` | `--accent-h` | Matiz del color de acento. Se usa para botones, sombras y textos con gradiente. |

---

### 2.2. Colores de Texto

| Propiedad JSON | Variable CSS (`:root`) | Clase CSS / Uso Directo | Descripción y Componentes |
| :--- | :--- | :--- | :--- |
| `text.highlighted` | `--text-highlighted` | `.text-highlighted` | Texto resaltado, generalmente con un efecto de brillo. |
| `text.dimmed` | `--text-dimmed` | `.text-dimmed` | Texto atenuado o de baja importancia. |
| `text.primary` | `--text-primary-custom`, `--text-primary`, `--foreground` | `.text-primary-custom`, `body` | Color de texto principal para el cuerpo de la aplicación. |
| `text.secondary` | `--text-secondary-custom`, `--text-secondary` | `.text-secondary-custom` | Color de texto secundario. |

---

### 2.3. Fondos y Tarjetas

| Propiedad JSON | Variable CSS (`:root`) | Clase CSS / Uso Directo | Descripción y Componentes |
| :--- | :--- | :--- | :--- |
| `background.gradient` | `--background` | `body` | Gradiente de fondo para toda la aplicación. |
| `cards.gradient` | `--card` | `.glass-effect` | Gradiente de fondo para los elementos con efecto "glass". |

---

### 2.4. Subtítulos (Letras de Canciones)

| Propiedad JSON | Variable CSS (`:root`) | Clase CSS / Uso Directo | Descripción y Componentes |
| :--- | :--- | :--- | :--- |
| `subtitles.base` | `--subtitles-base-h` | Múltiples (ver abajo) | Matiz base para todos los colores de los subtítulos. |
| (Calculado) | `--subtitle-highlighted` | `.lyric-current`, `.lyric-link` | Color para la línea actual de la letra y los enlaces. |
| (Calculado) | `--subtitle-dimmed` | `.lyric-prev`, `.lyric-next` | Color para las líneas anterior y siguiente de la letra. |
| (Calculado) | `--subtitle-bg` | `.lyrics-display` | Fondo del contenedor de las letras de las canciones. |

---

### 2.5. Variables CSS Derivadas y Clases de Efectos

La función `applyThemeColors` también genera variables CSS completas en formato HSL y otras para efectos visuales.

| Variable CSS (`:root`) | Generada a partir de | Clase CSS / Uso Directo | Descripción |
| :--- | :--- | :--- | :--- |
| `--primary` | `colors.primary` | `(Tailwind)` | Color primario completo para componentes de Tailwind. |
| `--primary-foreground` | `colors.primary` | `(Tailwind)` | Color de texto para usar sobre fondos con `--primary`. |
| `--secondary` | `colors.secondary` | `(Tailwind)` | Color secundario completo. |
| `--secondary-foreground` | `colors.secondary` | `(Tailwind)` | Color de texto para usar sobre fondos con `--secondary`. |
| `--accent` | `colors.accent` | `(Tailwind)` | Color de acento completo. |
| `--accent-foreground` | `colors.accent` | `(Tailwind)` | Color de texto para usar sobre fondos con `--accent`. |
| `--muted` | `colors.primary` | `(Tailwind)` | Color atenuado para elementos de fondo. |
| `--muted-foreground` | `colors.text.dimmed` | `(Tailwind)` | Color de texto para usar sobre fondos con `--muted`. |
| `--border` | `colors.primary` | `*` (global) | Color de borde para todos los elementos. |
| `--input` | `colors.primary` | `(Tailwind)` | Color para los campos de entrada (inputs). |
| `--ring` | `colors.accent` | `(Tailwind)` | Color para los anillos de foco (focus rings). |
| `--popover` | `colors.primary` | `(Tailwind)` | Color de fondo para popovers. |
| `--popover-foreground` | `colors.text.primary` | `(Tailwind)` | Color de texto para popovers. |
| `--radius` | (Fijo: `1.5rem`) | Múltiples | Radio de borde para botones, tarjetas, etc. |

#### Efectos de Neón y Brillo (Glow)

| Variable CSS (`:root`) | Generada a partir de | Clase CSS | Descripción |
| :--- | :--- | :--- | :--- |
| `--neon-primary` | `colors.primary` | `.neon-border`, `.synthwave-button:hover` | Sombra de brillo para bordes y botones. |
| `--neon-secondary` | `colors.secondary` | `.synthwave-button-secondary:hover` | Sombra de brillo para botones secundarios. |
| `--neon-accent` | `colors.accent` | - | Sombra de brillo para el color de acento. |
| `--text-neon-primary` | `colors.primary` | `.neon-text` | Sombra de brillo para textos. |
| `--text-neon-secondary` | `colors.secondary` | `.neon-text-secondary` | Sombra de brillo para textos secundarios. |

#### Clases de Brillo Específicas de Componentes

Estas clases aplican un efecto de `box-shadow` usando los colores HUE principales.

| Clase CSS | Color HUE Base | Componentes |
| :--- | :--- | :--- |
| `.albumart-glow` | `--primary-h` | Contenedor de la carátula del álbum. |
| `.musicplayer-glow` | `--secondary-h` | Contenedor del reproductor de música. |
| `.playlist-glow` | `--accent-h` | Contenedor de la lista de reproducción. |
| `.exclusions-glow` | `--primary-h` | Contenedor de la lista de exclusiones. |
| `.crt-glow` | `--subtitles-base-h` | Contenedor de las letras (simula un monitor CRT). |

## 3. Conclusión

Este sistema permite una personalización visual profunda y coherente a través de un único archivo de configuración JSON. Al modificar los valores en el JSON, se pueden cambiar los colores de toda la aplicación sin necesidad de tocar el código CSS, ya que todo está conectado a través de variables CSS dinámicas.
