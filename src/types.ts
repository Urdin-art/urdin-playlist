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
