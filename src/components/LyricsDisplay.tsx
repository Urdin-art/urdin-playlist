import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface LyricLine {
  startTime: number;
  endTime: number;
  text: string;
}

interface LyricsDisplayProps {
  lyricsFile?: string;
  currentTime: number;
  isPlaying: boolean;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyricsFile,
  currentTime,
  isPlaying,
}) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  useEffect(() => {
    if (!lyricsFile) {
      setLyrics([]);
      return;
    }

    const loadLyrics = async () => {
      try {
        const response = await fetch(lyricsFile);
        const vttText = await response.text();
        const parsedLyrics = parseVTT(vttText);
        setLyrics(parsedLyrics);
      } catch (error) {
        console.error('Error loading lyrics:', error);
        setLyrics([]);
      }
    };

    loadLyrics();
  }, [lyricsFile]);

  useEffect(() => {
    if (lyrics.length === 0) return;

    const currentIndex = lyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime < line.endTime
    );

    // Solo actualizar si el índice realmente cambió
    if (currentIndex !== currentLineIndex) {
      setCurrentLineIndex(currentIndex);
    }
  }, [currentTime, lyrics, currentLineIndex]);

  const parseVTT = (vttText: string): LyricLine[] => {
    const lines = vttText.split('\n');
    const lyricLines: LyricLine[] = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Buscar líneas de tiempo (formato: 00:00.000 --> 00:03.000)
      if (line.includes(' --> ')) {
        const [startStr, endStr] = line.split(' --> ');
        const startTime = parseTimeCode(startStr);
        const endTime = parseTimeCode(endStr);
        
        // La siguiente línea debería contener el texto
        i++;
        if (i < lines.length && lines[i].trim()) {
          lyricLines.push({
            startTime,
            endTime,
            text: lines[i].trim(),
          });
        }
      }
      i++;
    }
    
    return lyricLines;
  };

  const parseTimeCode = (timeStr: string): number => {
    // Formato VTT: 00:00:12.500 o 00:12.500
    const parts = timeStr.trim().split(':');
    
    if (parts.length === 3) {
      // Formato HH:MM:SS.mmm
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const [seconds, milliseconds] = parts[2].split('.');
      const sec = parseInt(seconds) || 0;
      const ms = milliseconds ? parseInt(milliseconds.padEnd(3, '0')) / 1000 : 0;
      return hours * 3600 + minutes * 60 + sec + ms;
    } else if (parts.length === 2) {
      // Formato MM:SS.mmm
      const minutes = parseInt(parts[0]) || 0;
      const [seconds, milliseconds] = parts[1].split('.');
      const sec = parseInt(seconds) || 0;
      const ms = milliseconds ? parseInt(milliseconds.padEnd(3, '0')) / 1000 : 0;
      return minutes * 60 + sec + ms;
    }
    
    return 0;
  };

  const getCurrentLyric = (): string => {
    if (currentLineIndex >= 0 && currentLineIndex < lyrics.length) {
      return lyrics[currentLineIndex].text;
    }
    return '';
  };

  const getPreviousLyric = (): string => {
    if (currentLineIndex > 0 && currentLineIndex - 1 < lyrics.length) {
      return lyrics[currentLineIndex - 1].text;
    }
    return '';
  };

  const getNextLyric = (): string => {
    if (currentLineIndex >= 0 && currentLineIndex + 1 < lyrics.length) {
      return lyrics[currentLineIndex + 1].text;
    }
    return '';
  };

  if (!lyricsFile || lyrics.length === 0) {
    return (
      <Card className="lcd-screen h-32 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">♪ ♫ ♪</div>
          <p className="text-neon-cyan">Letra no disponible</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="lyrics-display relative overflow-hidden">
      <div className="lyrics-content">
        {/* Línea anterior */}
        <div className="lyric-line lyric-prev">
          {getPreviousLyric()}
        </div>
        
        {/* Línea actual */}
        <div className="lyric-line lyric-current">
          {getCurrentLyric() || '♪ ♫ ♪'}
        </div>
        
        {/* Línea siguiente */}
        <div className="lyric-line lyric-next">
          {getNextLyric()}
        </div>
      </div>
      
      {/* Efecto de escaneo LCD mejorado */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="scan-lines"></div>
      </div>
    </Card>
  );
};