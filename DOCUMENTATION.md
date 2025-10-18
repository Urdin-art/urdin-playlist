# Documentación del Proyecto: Retro Beat Player

## 1. Descripción General

Retro Beat Player es una aplicación web de reproductor de música con una interfaz de inspiración retro-futurista. Permite a los usuarios escuchar listas de reproducción personalizadas, descubrir nuevas canciones y disfrutar de una experiencia visual y auditiva inmersiva.

La aplicación es altamente configurable a través de archivos JSON, permitiendo la personalización de temas de color, contenido de las listas de reproducción y otros aspectos de la interfaz.

## 2. Arquitectura del Proyecto

La aplicación está construida con React y TypeScript, utilizando Vite como herramienta de construcción.

### 2.1. Estructura de Archivos Clave

*   `index.html`: Punto de entrada de la aplicación.
*   `src/main.tsx`: Renderiza la aplicación React en el DOM.
*   `src/App.tsx`: Define las rutas principales de la aplicación.
*   `src/pages/Index.tsx`: Componente principal que renderiza la interfaz del reproductor.
*   `src/hooks/`: Contiene los hooks personalizados que manejan la lógica principal.
    *   `useAppConfig.ts`: Gestiona la carga de la configuración de la aplicación desde la URL y los archivos JSON.
    *   `useMusicPlayer.ts`: Gestiona la lógica de reproducción de música, carga de canciones y listas de reproducción.
*   `src/components/`: Contiene los componentes reutilizables de la interfaz de usuario.
*   `public/`: Contiene los archivos estáticos, incluyendo los archivos de configuración JSON, las canciones y las imágenes.

### 2.2. Flujo de Datos

1.  La aplicación se carga y el hook `useAppConfig` lee los parámetros `config` y `song` de la URL.
2.  Se carga el archivo de configuración JSON correspondiente (p. ej., `A-side.json`).
3.  El hook `useMusicPlayer` carga el archivo maestro de canciones (`songs-master.json`).
4.  Si se proporciona un `songId` en la URL, se carga esa canción específica.
5.  Si no hay `songId`, se carga la lista de reproducción definida en el archivo de configuración. Las listas de reproducción ahora solo contienen los IDs de las canciones, que se utilizan para buscar la información completa en `songs-master.json`.
6.  Los datos se pasan a los componentes de la interfaz de usuario para su renderización.

## 3. Configuración

La aplicación se configura principalmente a través de archivos JSON ubicados en el directorio `public/`.

### 3.1. Archivos de Configuración (`[nombre].json`)

Estos archivos definen el comportamiento y la apariencia de una "cara" o versión de la aplicación.

*   `logo`: Ruta al archivo del logotipo.
*   `tagline`: (Opcional) Texto plano que aparece debajo del logotipo. Puede contener variables dinámicas.
*   `tagline_html`: (Opcional) Texto con formato HTML que aparece debajo del logotipo. También puede contener variables dinámicas.
*   `sideSwitcher`: Configuración para el botón de cambio de "cara".
*   `playlist`: Ruta al archivo JSON de la lista de reproducción. Si está vacío o no se define, no se mostrará la sección de la playlist.
*   `storage`: Clave única para el almacenamiento local (`localStorage`).
*   `use_exclusions`: Habilita o deshabilita la lista de exclusión.
*   `colors`: Objeto que define la paleta de colores del tema.

### 3.2. Listas de Reproducción (`songs-[cara].json`)

Estos archivos contienen una lista de los `id` de las canciones que se incluirán en la lista de reproducción.

### 3.3. Archivo Maestro de Canciones (`songs-master.json`)

Este archivo es la base de datos central que contiene la información completa de todas las canciones disponibles en la aplicación.

## 4. Funcionalidades Implementadas

*   **Carga de configuración dinámica:** La aplicación puede cargar diferentes configuraciones basadas en el parámetro `config` de la URL.
*   **Listas de reproducción eficientes:** Las listas de reproducción ahora solo contienen IDs de canciones, reduciendo la redundancia de datos.
*   **Carga de canciones individuales:** Se puede cargar una canción específica a través del parámetro `song` en la URL.
*   **Ocultación de la playlist:** La sección de la playlist se oculta si no se define una lista de reproducción en la configuración.
*   **Tagline dinámico:** El tagline puede mostrar información dinámica como el título de la canción actual (`{CURRENT_SONG_TITLE}`) o la URL actual (`{CURRENT_URL}`).