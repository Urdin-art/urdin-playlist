export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  audioFile: string;
  albumArt: string;
  lyricsFile?: string;
  isNew?: boolean;
}

export interface AppConfig {
  logo: string;
  tagline?: string;
  tagline_html?: string;
  playlist: string;
  storage: string;
  use_exclusions: boolean;
  personal_list_button: {
    enabled: boolean;
    targetConfig?: string;
  };
  refresh_button: {
    enabled: boolean;
  };
  theme: string;
}

// Defines the structure for a gradient with from/to colors, type, and angle.
interface Gradient {
  from: string;
  to: string;
  type: string;
  angle: number;
}

// Defines the structure for border properties.
interface Border {
  color: string;
  width: string;
  radius: string;
}

// Defines the structure for glow effects.
interface Glow {
  color: string;
  size: string;
}

// Corresponds to the "simple" block in theme-*.json for quick configuration.
export interface SimpleTheme {
  primary: string;
  secondary: string;
  accent: string;
  cardBackground: string;
  pageBackground: string;
}

// Corresponds to the "complete" block in theme-*.json for detailed styling.
export interface CompleteTheme {
  navigation: {
    backgroundGradient: Gradient;
    borderColor: string;
    borderWidth: string;
    separatorColor: string;
    hoverMenuColor: string;
    hoverItemColor: string;
    textColor: string;
    hoverTextColor: string;
  };
  buttons: {
    inactive: { backgroundGradient: Gradient; borderColor: string; iconColor: string; glowColor: string; };
    hover: { backgroundGradient: Gradient; borderColor: string; iconColor: string; glowColor: string; };
    active: { backgroundGradient: Gradient; borderColor: string; iconColor: string; glowColor: string; };
    glowSize: string;
    borderRadius: string;
  };
  backgrounds: {
    page: Gradient;
    albumArtCard: Gradient;
    playerCard: Gradient;
    playlistCard: Gradient;
    exclusionsCard: Gradient;
  };
  text: {
    headerFooter: { normal: string; highlighted: string; };
    player: { title: string; artist: string; album: string; timestamp: string; };
    playlist: { title: string; titleActive: string; secondary: string; icons: string; };
  };
  lyricsCard: {
    background: string;
    scanlines: string;
    textHighlighted: string;
    textDimmed: string;
    glowColor: string;
    glowSize: string;
    borderColor: string;
    borderWidth: string;
    borderRadius: string;
  };
  borders: {
    menu: Border;
    albumArtCard: Border;
    playerCard: Border;
    playlistCard: Border;
    playlistItem: Border;
    exclusionsCard: Border;
  };
  glows: {
    menu: Glow;
    albumArtCard: Glow;
    playerCard: Glow;
    playlistCard: Glow;
    playlistItem: Glow;
    exclusionsCard: Glow;
  };
}

// Represents the entire theme object structure from a theme-*.json file.
export interface Theme {
  simple: SimpleTheme;
  complete: CompleteTheme;
}