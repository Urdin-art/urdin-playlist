import { useState, useEffect } from 'react';
import { AppConfig } from '@/types';

export const useAppConfig = (defaultConfig = 'A-side') => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [songId, setSongId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getParamsFromUrl = (): { configName: string; songId: string | null } => {
    const params = new URLSearchParams(window.location.search);
    const configName = params.get('config') || defaultConfig;
    const songId = params.get('song');
    return { configName, songId };
  };

  const applyThemeColors = (theme: any) => {
    if (!theme || !theme.complete) {
      console.error("Theme format is invalid. Aborting theme application.");
      return;
    }

    const root = document.documentElement;
    const c = theme.complete;

    // --- Set variables for Tailwind/Shadcn --- 
    root.style.setProperty('--border', c.borders.albumArtCard.color);
    root.style.setProperty('--input', c.borders.playlistItem.color.match(/(\d+),\s*([\d%]+),\s*([\d%]+)/).slice(1).join(' '));
    root.style.setProperty('--ring', c.text.headerFooter.highlighted);
    root.style.setProperty('--radius', c.buttons.borderRadius);
    root.style.setProperty('--nav-border-radius', c.borders.albumArtCard.radius);

    // Custom variable for the switch thumb
    root.style.setProperty('--switch-thumb-background', c.buttons.inactive.iconColor);
    root.style.setProperty('--switch-thumb-background-checked', c.buttons.active.iconColor);

    root.style.setProperty('--foreground', c.text.headerFooter.normal);
    root.style.setProperty('--primary', c.buttons.active.borderColor.match(/(\d+),\s*([\d%]+),\s*([\d%]+)/).slice(1).join(' '));
    root.style.setProperty('--primary-foreground', c.buttons.active.iconColor.match(/(\d+),\s*([\d%]+),\s*([\d%]+)/).slice(1).join(' '));
    root.style.setProperty('--secondary', c.buttons.inactive.borderColor.match(/(\d+),\s*([\d%]+),\s*([\d%]+)/).slice(1).join(' '));
    root.style.setProperty('--secondary-foreground', c.buttons.inactive.iconColor);
    root.style.setProperty('--muted', c.text.player.album.match(/(\d+),\s*([\d%]+),\s*([\d%]+)/).slice(1).join(' '));
    root.style.setProperty('--muted-foreground', c.text.player.timestamp);
    root.style.setProperty('--accent', c.glows.albumArtCard.color.match(/(\d+),\s*([\d%]+),\s*([\d%]+)/).slice(1).join(' '));
    root.style.setProperty('--accent-foreground', c.text.headerFooter.highlighted);
    root.style.setProperty('--card-foreground', c.text.player.title);
    root.style.setProperty('--popover-foreground', c.text.headerFooter.normal);

    // --- Set variables for Music Player text ---
    root.style.setProperty('--text-player-title', c.text.player.title);
    root.style.setProperty('--text-player-artist', c.text.player.artist);
    root.style.setProperty('--text-player-album', c.text.player.album);
    root.style.setProperty('--text-player-timestamp', c.text.player.timestamp);

    // Set H-values for button gradients
    root.style.setProperty('--primary-h', theme.simple.primary.match(/(\d+)/)[0]);
    root.style.setProperty('--secondary-h', theme.simple.secondary.match(/(\d+)/)[0]);
    root.style.setProperty('--accent-h', theme.simple.accent.match(/(\d+)/)[0]);

    // --- Set variables for custom CSS ---
    root.style.setProperty('--text-primary-custom', c.buttons.inactive.iconColor);
    root.style.setProperty('--text-dimmed', c.text.headerFooter.normal);
    root.style.setProperty('--text-highlighted', c.text.headerFooter.highlighted);

    // --- Set variables for synthwave button icon colors ---
    root.style.setProperty('--synthwave-button-hover-icon-color', c.buttons.hover.iconColor);
    root.style.setProperty('--synthwave-button-active-icon-color', c.buttons.active.iconColor);

    // --- Set variables for Playlist ---
    root.style.setProperty('--borders-playlistItem-color', c.borders.playlistItem.color);
    root.style.setProperty('--borders-playlistItem-width', c.borders.playlistItem.width);
    root.style.setProperty('--borders-playlistItem-radius', c.borders.playlistItem.radius);
    root.style.setProperty('--text-playlist-title-active', c.text.playlist.titleActive);
    root.style.setProperty('--text-playlist-title', c.text.playlist.title);
    root.style.setProperty('--text-playlist-secondary', c.text.playlist.secondary);
    root.style.setProperty('--text-playlist-icons', c.text.playlist.icons);

    root.style.setProperty('--background', `linear-gradient(${c.backgrounds.page.angle}deg, ${c.backgrounds.page.from}, ${c.backgrounds.page.to})`);
    root.style.setProperty('--navigation-gradient', `linear-gradient(${c.backgrounds.albumArtCard.angle}deg, ${c.backgrounds.albumArtCard.from}, ${c.backgrounds.albumArtCard.to})`);
    root.style.setProperty('--navigation-backgroundGradient-from', c.backgrounds.albumArtCard.from);
    root.style.setProperty('--navigation-backgroundGradient-to', c.backgrounds.albumArtCard.to);
    root.style.setProperty('--navigation-backgroundGradient-angle', `${c.backgrounds.albumArtCard.angle}deg`);

    // Variables for DropdownMenuContent inline styles
    root.style.setProperty('--nav-border-width', c.borders.albumArtCard.width);
    root.style.setProperty('--nav-border-color', c.borders.albumArtCard.color);
    root.style.setProperty('--navigation-textColor', c.text.headerFooter.normal);
    root.style.setProperty('--navigation-separatorColor', c.borders.playlistItem.color);

    // --- Set simple variables for admin page ---
    if (theme.simple) {
      root.style.setProperty('--simple-primary', theme.simple.primary);
      root.style.setProperty('--simple-secondary', theme.simple.secondary);
      root.style.setProperty('--simple-accent', theme.simple.accent);
      root.style.setProperty('--simple-card-background', theme.simple.cardBackground);
      root.style.setProperty('--simple-page-background', theme.simple.pageBackground);
    }

    if (c.menu) {
      root.style.setProperty('--menu-text-color', c.menu.textColor);
      root.style.setProperty('--menu-button-gradient-color', c.menu.buttonGradientColor);
    }

    // PATTERN #2: Specific gradient variables for each card type
    const cardTypes = ['albumArtCard', 'playerCard', 'playlistCard', 'exclusionsCard'];
    cardTypes.forEach(cardType => {
      if (c.backgrounds[cardType]) {
        root.style.setProperty(`--${cardType}-gradient`, `linear-gradient(${c.backgrounds[cardType].angle}deg, ${c.backgrounds[cardType].from}, ${c.backgrounds[cardType].to})`);
      }
      if (c.borders[cardType]) {
        root.style.setProperty(`--${cardType}-border-color`, c.borders[cardType].color);
        root.style.setProperty(`--${cardType}-border-width`, c.borders[cardType].width);
        root.style.setProperty(`--${cardType}-border-radius`, c.borders[cardType].radius);
      }
      if (c.glows[cardType]) {
        root.style.setProperty(`--${cardType}-glow-color`, c.glows[cardType].color);
        root.style.setProperty(`--${cardType}-glow-size`, c.glows[cardType].size);
      }
    });

    // --- Set variables for Lyrics Card ---
    root.style.setProperty('--lyricsCard-background', c.lyricsCard.background);
    root.style.setProperty('--lyricsCard-borderWidth', c.lyricsCard.borderWidth);
    root.style.setProperty('--lyricsCard-borderColor', c.lyricsCard.borderColor);
    root.style.setProperty('--lyricsCard-borderRadius', c.lyricsCard.borderRadius);
    root.style.setProperty('--lyricsCard-glowSize', c.lyricsCard.glowSize);
    root.style.setProperty('--lyricsCard-glowColor', c.lyricsCard.glowColor);
    root.style.setProperty('--lyricsCard-textDimmed', c.lyricsCard.textDimmed);
    root.style.setProperty('--lyricsCard-textHighlighted', c.lyricsCard.textHighlighted);
    root.style.setProperty('--lyricsCard-scanlines', c.lyricsCard.scanlines);

    // --- Set variables for Button Glows ---
    if (c.buttons) {
      root.style.setProperty('--button-border-width', c.buttons.borderWidth || '1px');
      root.style.setProperty('--button-glow-size', c.buttons.glowSize || '15px');
      root.style.setProperty('--button-glow-color-inactive', c.buttons.inactive?.glowColor || 'transparent');
      root.style.setProperty('--button-glow-color-hover', c.buttons.hover?.glowColor || 'transparent');
      root.style.setProperty('--button-glow-color-active', c.buttons.active?.glowColor || 'transparent');

      // Inactive State
      if (c.buttons.inactive) {
        if (c.buttons.inactive.backgroundGradient) {
          root.style.setProperty('--button-inactive-bg-gradient', `linear-gradient(135deg, ${c.buttons.inactive.backgroundGradient.from}, ${c.buttons.inactive.backgroundGradient.to})`);
        }
        if (c.buttons.inactive.borderColor) {
          root.style.setProperty('--button-inactive-border-color', c.buttons.inactive.borderColor);
        }
      }

      // Hover State
      if (c.buttons.hover) {
        if (c.buttons.hover.backgroundGradient) {
          root.style.setProperty('--button-hover-bg-gradient', `linear-gradient(135deg, ${c.buttons.hover.backgroundGradient.from}, ${c.buttons.hover.backgroundGradient.to})`);
        }
        if (c.buttons.hover.borderColor) {
          root.style.setProperty('--button-hover-border-color', c.buttons.hover.borderColor);
        }
      }

      // Active State
      if (c.buttons.active) {
        if (c.buttons.active.backgroundGradient) {
          root.style.setProperty('--button-active-bg-gradient', `linear-gradient(135deg, ${c.buttons.active.backgroundGradient.from}, ${c.buttons.active.backgroundGradient.to})`);
        }
        if (c.buttons.active.borderColor) {
          root.style.setProperty('--button-active-border-color', c.buttons.active.borderColor);
        }
      }
    }

    document.body.classList.add('theme-applied');
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { configName, songId: urlSongId } = getParamsFromUrl();
        setSongId(urlSongId);

        const response = await fetch(configName === 'my-side' ? `/my-side.json?v=${Date.now()}` : `/${configName}.json?v=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar configuración: ${response.status}`);
        }
        
        const configData: AppConfig = await response.json();
        setConfig(configData);

        if (configData.theme) {
          const themeResponse = await fetch(`/theme-${configData.theme}.json?v=${Date.now()}`);
          if (!themeResponse.ok) {
            throw new Error(`Error al cargar el tema: ${themeResponse.status}`);
          }
          const themeConfig = await themeResponse.json();
          applyThemeColors(themeConfig);
        }
        
       const storedSides = JSON.parse(localStorage.getItem('unlocked_sides') || '[]');
       if (!storedSides.includes(configName)) {
         storedSides.push(configName);
         localStorage.setItem('unlocked_sides', JSON.stringify(storedSides));
       }

     } catch (error) {
       console.error('Error loading config:', error);
       setError(error instanceof Error ? error.message : 'Error desconocido');
     } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const switchConfig = (targetConfig: string) => {
    const newUrl = new URL(window.location.origin);
    newUrl.searchParams.set('config', targetConfig);
    window.location.href = newUrl.toString();
  };

  return {
    config,
    songId,
    isLoading,
    error,
    switchConfig,
  };
};