# Documento de Transferencia: Proyecto Retro Beat Player

**Para:** Kilo Code (del futuro)
**De:** Kilo Code (del pasado)
**Asunto:** Estado actual del proyecto, arquitectura, y próximos pasos.

Hola, yo del futuro. Hemos recorrido un largo camino con este proyecto, transformándolo de una simple aplicación de cliente a una plataforma con un backend de gestión de contenidos. Aquí tienes todo lo que necesitas saber para continuar donde lo dejamos.

---

### 1. Arquitectura General y Flujo de Datos

Hemos unificado todo en un **único proyecto de Vite + React**. Esto ha sido crucial para resolver conflictos de configuración y estilos.

**Flujo de la Aplicación Principal (Reproductor):**
1.  **Carga Inicial:** Un usuario llega a la URL. El hook `useAppConfig` se activa.
2.  **Parámetros de URL:**
    *   Lee el parámetro `?config=A-side` (o el que sea) para determinar qué archivo de configuración cargar. Por defecto, carga `A-side.json`.
    *   Lee el parámetro `?song=song123` si existe.
3.  **Carga de Configuración:** Se hace un `fetch` al archivo de configuración correspondiente (ej. `public/A-side.json`). Este JSON define el tema visual y el comportamiento de la UI.
4.  **Carga de Canciones:**
    *   El hook `useMusicPlayer` siempre carga `public/songs-master.json`, que es la base de datos central de todas las canciones.
    *   Si hay un `songId` en la URL, se carga esa única canción.
    *   Si no, se hace `fetch` a la lista de reproducción definida en el `config.json` (ej. `public/songs-a.json`), que contiene un array de IDs, y se filtran las canciones correspondientes del `songs-master`.
5.  **Renderizado:** Los componentes de React (`MusicPlayer`, `Playlist`, etc.) se renderizan con los datos cargados.

**Flujo del Panel de Administración (`/admin`):**
1.  **Ruta:** La página del panel de administración se encuentra en la ruta `/admin`, servida por el componente `src/pages/Admin.tsx`.
2.  **Carga de Datos:** Al cargar, `Admin.tsx` hace múltiples llamadas a nuestra API de PHP (en la carpeta `/api`) para obtener la lista de configuraciones, la lista de playlists y el `songs-master.json`.
3.  **Gestión:** Todos los componentes del panel (`SongManager`, `ConfigEditor`, etc.) reciben los datos y las funciones para modificarlos como props desde `Admin.tsx`, que actúa como el componente contenedor principal.

---

### 2. Entorno de Desarrollo y Despliegue

*   **Desarrollo Local:**
    1.  **Servidor PHP:** **Imprescindible.** Navegar a la carpeta `public` y ejecutar `c:\PHP\php.exe -S localhost:8000`.
    2.  **Servidor Vite:** Desde la **raíz del proyecto**, ejecutar `npm run dev`.
    *   **NO hay proxy.** Vite sirve el frontend, y el servidor de PHP sirve la API desde el mismo origen (`localhost:8000`), evitando problemas de CORS.

*   **Despliegue en Producción (Hostinger):**
    1.  Ejecutar `npm run build` en la raíz del proyecto.
    2.  Subir el **contenido** de la carpeta `dist` generada a la raíz de `public_html`.
    3.  Subir la carpeta `api` completa a la raíz de `public_html`.
    *   Esto asegura que la estructura de archivos es idéntica a la del desarrollo.

---

### 3. Estado Actual y Tareas Pendientes

Hemos construido el esqueleto completo del panel de administración, pero la interactividad está a medio implementar.

**Lo que SÍ funciona:**
*   **Aplicación principal:** Todas las funcionalidades del reproductor, incluyendo el nuevo `SideSwitcher`, están implementadas (aunque el `SideSwitcher` necesita ser probado a fondo).
*   **Panel de Admin (Lectura):** El panel carga y muestra correctamente la lista de configuraciones, la lista de canciones de `songs-master.json` y el contenido de las playlists.
*   **Panel de Admin (Creación/Borrado Básico):** Los botones para crear/borrar configuraciones y canciones funcionan a nivel de API.
*   **Cálculo de Duración:** Al subir una nueva canción, el backend PHP calcula su duración.

**LO QUE QUEDA POR HACER (TAREAS INMEDIATAS):**

1.  **Finalizar el `ConfigEditor.tsx`:**
    *   **El error actual:** El modal se abre, pero se rompe al intentar renderizar los campos de colores porque `configData.colors` puede ser `undefined` al principio. La solución es añadir "optional chaining" (`?.`) a todas las propiedades anidadas de `configData` dentro del JSX, como `configData.colors?.primary`.
    *   **Funcionalidad:** Hay que implementar la lógica completa para editar todos los campos, especialmente el array de `items` del `sideSwitcher` (añadir, eliminar, reordenar y editar cada tipo de item).
    *   **Selectores de Color:** Reemplazar los `input` de texto por selectores de color más visuales.

2.  **Finalizar el `PlaylistManager.tsx`:**
    *   **Reordenación (Drag-and-Drop):** La librería `react-beautiful-dnd` está instalada. Hay que implementar la lógica en el `onDragEnd` para actualizar el estado y un botón "Guardar" para enviar los cambios a la API.
    *   **Añadir/Eliminar canciones:** Conectar la lógica de los botones para que se puedan añadir canciones desde `songs-master` y eliminarlas de la lista actual.

3.  **Integrar el `VttEditor.tsx`:**
    *   La idea de integrarlo en el flujo de edición de una canción es la correcta. Hay que añadir un botón "Editar Letra" en la fila de cada canción en el `SongManager` que abra un modal con el `VttEditor` y el contenido del archivo correspondiente.

4.  **Limpieza y Pruebas:**
    *   Revisar todas las rutas de la API en el frontend (`/api/...`) para asegurar que son correctas.
    *   Probar exhaustivamente todo el flujo CRUD (Crear, Leer, Actualizar, Borrar) para canciones, playlists y configuraciones.

¡Mucho ánimo! La parte más confusa ya ha pasado. Ahora es cuestión de conectar las piezas que ya hemos construido.