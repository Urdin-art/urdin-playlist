# GEMINI.md: Retro Beat Player

## Project Overview

This project is a retro-futuristic themed web-based music player called "Retro Beat Player". It is a single-page application (SPA) built with **React** and **TypeScript**, using **Vite** as the build tool. The application is highly customizable through JSON configuration files, allowing for different themes, playlists, and UI elements to be loaded dynamically based on URL parameters.

The core of the application's logic is handled by custom hooks:
*   `useAppConfig.ts`: Manages the loading of application configuration and themes from JSON files based on URL parameters.
*   `useMusicPlayer.ts`: Handles the music playback, playlist management, and song loading.

The UI is built with **shadcn/ui** components and styled with **Tailwind CSS**. The theming is highly dynamic and controlled by CSS custom properties, which are set in the `useAppConfig.ts` hook.

## Building and Running

### Key Commands

*   **`npm install`**: Installs the project dependencies.
*   **`npm run dev`**: Starts the development server with hot-reloading at `http://localhost:5173`.
*   **`npm run build`**: Builds the application for production in the `dist` directory.
*   **`npm run lint`**: Lints the codebase using ESLint to enforce code quality.
*   **`npm run generate-master-playlist`**: Runs a script to generate the `songs-master.json` file from individual song JSON files.

### Development Proxy

The `vite.config.ts` file is configured to proxy API requests to `/api` to `http://localhost:8000` during development. This is useful for running a local backend server for development purposes.

## Development Conventions

### Code Style and Formatting

The project uses **ESLint** for linting and likely **Prettier** for code formatting, as inferred from the consistent code style and the presence of a `tailwind.config.ts` file. Adhere to the existing code style and formatting when making changes.

### Theming System

The application's theming is a critical and flexible aspect of its architecture. The system is designed to allow for deep customization of the UI at runtime by loading theme configurations from JSON files.

#### Theme File Structure

Theme files (e.g., `public/theme-A.json`) are structured with two main objects:

*   **`simple`**: Contains a few base color values (primary, secondary, accent, etc.). These are not applied directly but are used to calculate the detailed values in the `complete` object. This allows for quick, high-level theme adjustments.
*   **`complete`**: A comprehensive, nested object that defines every customizable aspect of the UI, from navigation and button styles to backgrounds, text colors, borders, and glow effects for each component.

#### How It Works

1.  **Configuration Loading**: The `useAppConfig.ts` hook reads the `config` parameter from the URL to determine which configuration file to load (e.g., `public/A-side.json`).
2.  **Theme Loading**: The configuration file specifies a theme (e.g., `"theme": "A"`), which prompts `useAppConfig.ts` to fetch the corresponding theme file (e.g., `public/theme-A.json`).
3.  **Dynamic Style Injection**: The `applyThemeColors` function within `useAppConfig.ts` processes the `complete` object from the theme file. It recursively traverses this object and injects the values into the DOM as CSS custom properties (e.g., `--navigation-background-gradient`, `--buttons-inactive-glow-color`).
4.  **CSS Consumption**: The application's CSS (`index.css`) and component styles use these CSS variables (`var(...)`) to style the UI.

This architecture allows for entire themes to be swapped dynamically without touching the application's code, simply by changing the theme JSON files.

### Styling and Component Conventions

Due to the interaction between the dynamic theme system and the build-time nature of Tailwind CSS/Shadcn, specific patterns must be followed when applying styles:

1.  **For Simple, Solid Colors (The Tailwind/Shadcn Way)**:
    *   **What**: Used for component properties that expect a single, solid color (e.g., text color, popover backgrounds).
    *   **How**: In `useAppConfig.ts`, the script extracts the HSL components from a color in the theme file and sets a CSS variable that Tailwind expects (e.g., `--popover`). The `tailwind.config.ts` file is configured to use this variable (e.g., `colors: { popover: 'hsl(var(--popover))' }`).
    *   **Result**: Standard Tailwind utility classes (e.g., `bg-popover`) work correctly with the dynamic theme.

2.  **For Complex Backgrounds (Gradients)**:
    *   **What**: Used for custom component backgrounds that require a `linear-gradient`.
    *   **How**: In `useAppConfig.ts`, the script constructs the *entire* `linear-gradient(...)` string and sets it to a specific CSS variable (e.g., `--album-art-card-gradient`). A dedicated CSS class in `index.css` then applies this variable (e.g., `.theme-album-art-card { background: var(--album-art-card-gradient); }`). The component uses this specific class (`className="theme-album-art-card"`).

3.  **For Complex Library Components with Gradients**:
    *   **What**: When a third-party library component (like a dropdown menu) needs a gradient background.
    *   **How**: The most reliable method is an inline style override. `useAppConfig.ts` creates the full gradient string as a CSS variable (e.g., `--navigation-gradient`). The component is then modified in its source file to apply this variable directly via an inline `style` attribute (`style={{ background: "var(--navigation-gradient)" }}`). Overriding from external CSS files is unreliable.

### Configuration

The application's behavior is driven by configuration files located in the `public` directory. These files define the "sides" of the player (e.g., `A-side.json`, `B-side.json`), which specify the theme, playlist, and other UI elements to be used.

### Playlist Management

The `useMusicPlayer.ts` hook manages the playlists. The master list of all songs is in `public/songs-master.json`. Individual playlists (e.g., `public/songs-a.json`) contain a list of song IDs that are used to look up the full song details in the master list.
