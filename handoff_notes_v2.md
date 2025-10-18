# Documento de Transferencia v2: Proyecto Retro Beat Player

**Para:** Kilo Code (del futuro, con la mente fresca)
**De:** Kilo Code (del pasado, con el contexto a punto de agotarse)
**Asunto:** Estado del proyecto, logros y el último bug del Autoplay.

Hola, yo del futuro.

Hemos tenido una sesión de desarrollo increíblemente productiva, pero también muy larga. Hemos implementado una cantidad enorme de mejoras y correcciones, pero mi ventana de contexto está llegando a su límite y he cometido errores críticos al intentar solucionar el último bug. Para evitar más problemas, he decidido documentar todo para que puedas retomarlo con una perspectiva clara.

---

### 1. Logros de esta Sesión (¡Hemos hecho mucho!)

Hemos transformado la aplicación, especialmente el panel de administración, en una herramienta mucho más robusta, usable y estéticamente coherente.

**Mejoras Funcionales y de Usabilidad:**
*   **Autoplay Controlable:** Se ha añadido un interruptor en el reproductor que permite al usuario activar o desactivar el paso automático a la siguiente canción.
*   **Lógica de Shuffle Mejorada:** El modo aleatorio ahora crea una cola de reproducción que asegura que cada canción suene una sola vez por ciclo, evitando repeticiones.
*   **Gestión de Contenidos Ampliada:**
    *   El formulario para añadir canciones ahora permite subir una **portada animada en formato MP4**. La lógica del backend ha sido adaptada para que guarde este archivo con el mismo nombre que la carátula principal, siguiendo las convenciones del proyecto.
    *   La creación de playlists y configuraciones en el panel de admin es más intuitiva, pidiendo solo la parte variable del nombre del archivo.
    *   Se ha añadido una función de **"Seleccionar Todo"** en el gestor de archivos huérfanos.
*   **Tooltips Explicativos:** Se ha implementado un sistema de tooltips en todo el reproductor (botones de shuffle, repeat, mute, mi lista, descargar) y en los controles de la playlist (excluir, mi lista, subir/bajar) para mejorar la claridad de la interfaz.
*   **SideSwitcher Potenciado:**
    *   Se han añadido múltiples tipos de ítems nuevos (`side_unlocked`, `url_button`, `pwa_button`, `terms_button`, `mail_button`), configurables desde el panel de admin.
    *   Se ha implementado la lógica para los "lados desbloqueables" (`side_unlocked`), que guarda las configuraciones visitadas en `localStorage` y solo muestra los enlaces si han sido previamente descubiertos.
    *   Se ha corregido el funcionamiento de los botones que abren modales (Términos y Contacto).

**Mejoras Estéticas y de Coherencia:**
*   **Panel de Admin Unificado:** El panel de administración ahora carga su propio archivo de configuración (`admin-side.json`) y aplica el mismo sistema de temas (colores, degradados, fuentes) que la aplicación principal.
*   **Layouts Mejorados:**
    *   El layout del `AlbumArt` y el `MusicPlayer` ha sido ajustado con Flexbox para que ambos mantengan la misma altura y el `AlbumArt` conserve siempre su proporción cuadrada.
    *   Se ha centrado el logo en la cabecera del panel de admin.
*   **Estilos Dinámicos:** Los botones de Shuffle, Repeat y Mute ahora cambian de estilo para reflejar si su función está activa, igual que el botón de Play/Pausa.
*   **SideSwitcher Rediseñado:** Se han eliminado los iconos fijos, se ha mejorado la legibilidad del texto y el menú ahora usa los degradados del tema, alineándose correctamente con el botón que lo activa.

**Corrección de Errores Críticos:**
*   Se solucionó el problema que impedía guardar nuevas canciones (relacionado con la configuración de PHP y la generación de rutas en el backend).
*   Se arregló el editor de subtítulos VTT, que no encontraba los archivos por un problema de rutas.
*   Se corrigió el gestor de archivos huérfanos.
*   Se solucionaron los problemas de enrutamiento en el servidor de producción (error 404 en `/admin`) mediante la configuración del `.htaccess`.

---

### 2. El Último Bug: El Autoplay Roto

Aquí es donde necesito que te concentres. A pesar de varios intentos, he fallado en implementar correctamente la lógica del autoplay y he introducido regresiones.

**El Comportamiento Deseado (y la regla de oro):**
1.  **NUNCA** debe haber autoplay al cargar la página por primera vez. La reproducción solo puede comenzar con una interacción explícita del usuario (clic en Play, en una canción, etc.).
2.  Una vez que la reproducción ha comenzado, si el interruptor de **"Autoplay" está activado**, al terminar una canción (o al pulsar "next"/"prev"), la siguiente canción debe cargarse y **reproducirse automáticamente**.
3.  Si el interruptor de **"Autoplay" está desactivado**, al terminar una canción, esta debe detenerse. Si se pulsa "next"/"prev", la nueva canción debe cargarse, pero **no reproducirse**.

**El Problema Actual:**
*   Mi último intento rompió el autoplay por completo. Al terminar una canción, la siguiente se carga pero no se reproduce, incluso con el interruptor activado.
*   También se rompieron la barra de progreso y los contadores de tiempo.

**La Causa Raíz (Mi Hipótesis):**
Al intentar eliminar el autoplay inicial, eliminé o modifiqué erróneamente la lógica que se encarga de gestionar los eventos del tag `<audio>` y de reactivar la reproducción tras un cambio de canción. El problema está, sin duda, en los `useEffect` dentro de `src/components/MusicPlayer.tsx`.

**Tu Misión:**
*   **Revisa `src/components/MusicPlayer.tsx` con calma.**
*   **Restaura la lógica de eventos del tag `<audio>`** (`onTimeUpdate`, `onLoadedData`, etc.) para que la barra de progreso y los contadores funcionen. La forma más segura es usar `addEventListener` dentro de un `useEffect` que se ejecute solo cuando cambie `currentSong`.
*   **Implementa la lógica de autoplay correcta:** La forma más limpia es usar el evento `onLoadedData` del tag `<audio>`. Cuando este evento se dispare (lo que significa que la nueva canción está lista), comprueba si `isAutoplay` es `true` y si la reproducción estaba activa antes del cambio. Si es así, llama a `audioRef.current.play()`.

Estoy seguro de que con una nueva perspectiva, resolverás esto de forma limpia y elegante. Todo lo demás está en un estado excelente.

¡Mucha suerte!