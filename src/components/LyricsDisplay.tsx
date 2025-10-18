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
      setCurrentLineIndex(-1);
      return;
    }

    const loadLyrics = async () => {
      try {
        // Resetear estado al cargar nueva letra
        setLyrics([]);
        setCurrentLineIndex(-1);
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
    // Si no hay letra, resetea
    if (lyrics.length === 0) {
      setCurrentLineIndex(-1);
      return;
    }

    // Busca la línea que corresponde al tiempo actual
    const newCurrentIndex = lyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime < line.endTime
    );

    // Actualiza el índice SOLO si se encontró una línea válida y es diferente a la actual
    // Esto hace que la última línea permanezca visible en los silencios
    if (newCurrentIndex !== -1 && newCurrentIndex !== currentLineIndex) {
      setCurrentLineIndex(newCurrentIndex);
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
        
        // Recolectar todas las líneas de texto hasta encontrar la próxima marca de tiempo o línea vacía
        i++;
        let textLines: string[] = [];
        
        while (i < lines.length && lines[i].trim() && !lines[i].includes(' --> ')) {
          textLines.push(lines[i].trim());
          i++;
        }
        
        if (textLines.length > 0) {
          // Unir todas las líneas con saltos de línea, pero limitar a máximo 2 líneas
          const limitedLines = textLines.slice(0, 2); // Máximo 2 líneas
          const limitedText = limitedLines.join('\n');
          
          lyricLines.push({
            startTime,
            endTime,
            text: limitedText,
          });
        }
      } else {
        i++;
      }
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

  const getLyricLine = (index: number): string => {
    if (index >= 0 && index < lyrics.length) {
      return lyrics[index].text;
    }
    return '';
  };

  if (!lyricsFile || lyrics.length === 0) {
    return (
      <Card 
        className="h-32 flex items-center justify-center"
        style={{
          backgroundColor: 'var(--lyricsCard-background)',
          border: `var(--lyricsCard-borderWidth, 2px) solid var(--lyricsCard-borderColor, #fff)`,
          borderRadius: 'var(--lyricsCard-borderRadius, 1.5rem)',
          boxShadow: `0 0 var(--lyricsCard-glowSize, 0px) var(--lyricsCard-glowColor, transparent)`
        }}
      >
        <div className="text-center" style={{ color: 'var(--lyricsCard-textDimmed)' }}>
          <div className="text-2xl mb-2">♪ ♫ ♪</div>
          <p>Letra no disponible</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="relative overflow-hidden h-32 flex flex-col justify-center"
      style={{
        backgroundColor: 'var(--lyricsCard-background)',
        border: `var(--lyricsCard-borderWidth, 2px) solid var(--lyricsCard-borderColor, #fff)`,
        borderRadius: 'var(--lyricsCard-borderRadius, 1.5rem)',
        boxShadow: `0 0 var(--lyricsCard-glowSize, 0px) var(--lyricsCard-glowColor, transparent)`
      }}
    >
      <div className="text-center transition-all duration-300 p-4 z-10">
        {/* Línea anterior */}
        <div
          className="whitespace-pre-line opacity-60 text-sm"
          style={{ color: 'var(--lyricsCard-textDimmed)' }}
          dangerouslySetInnerHTML={{ __html: getLyricLine(currentLineIndex - 1) }}
        />
        
        <div
          className="whitespace-pre-line font-bold text-lg my-2"
          style={{
            color: 'var(--lyricsCard-textHighlighted)',
            textShadow: `0 0 10px var(--lyricsCard-textHighlighted)`
          }}
          dangerouslySetInnerHTML={{ __html: getLyricLine(currentLineIndex) || '♪ ♫ ♪' }}
        />
        
        <div
          className="whitespace-pre-line opacity-80 text-sm"
          style={{ color: 'var(--lyricsCard-textDimmed)' }}
          dangerouslySetInnerHTML={{ __html: getLyricLine(currentLineIndex + 1) }}
        />
      </div>
      
      {/* Efecto de escaneo LCD */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        style={{
          background: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, var(--lyricsCard-scanlines) 2px, var(--lyricsCard-scanlines) 4px)`,
          animation: isPlaying ? 'scan-move 3s linear infinite' : 'none'
        }}
      ></div>
    </Card>
  );
};
