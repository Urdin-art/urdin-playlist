import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ImageLoader } from './ImageLoader';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Play, Pause, Video, VideoOff } from 'lucide-react';

interface Song {
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

interface AlbumArtProps {
  song: Song | null;
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export const AlbumArt: React.FC<AlbumArtProps> = ({ song, isPlaying = false, onPlayPause }) => {
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const savedState = localStorage.getItem('musicPlayer_animations');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Guardar estado de animaciones en localStorage
  useEffect(() => {
    localStorage.setItem('musicPlayer_animations', JSON.stringify(animationsEnabled));
  }, [animationsEnabled]);

  // Manejar clic en todo el albumart
  const handleAlbumArtClick = () => {
    if (onPlayPause) {
      onPlayPause();
    }
  };

  if (!song) {
    return (
      <Card className="glass-effect aspect-square flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🎵</div>
          <p>No Song Selected</p>
        </div>
      </Card>
    );
  }

  // Remove the file extension from the path
  const removeExtension = (path: string): string => {
    const lastDotIndex = path.lastIndexOf('.');
    return lastDotIndex !== -1 ? path.substring(0, lastDotIndex) : path;
  };

  const basePath = removeExtension(song.albumArt);

  // Determinar las extensiones según el estado de animaciones
  const getPriorityExtensions = () => {
    if (animationsEnabled) {
      return ['mp4', 'jpg', 'png'];
    } else {
      // Si las animaciones están desactivadas, cargar primero JPG para mejor rendimiento
      return ['jpg', 'png', 'mp4'];
    }
  };

  return (
    <TooltipProvider>
      <Card className="p-2 w-full h-full bg-transparent border-none shadow-none">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <ImageLoader
            basePath={basePath}
            alt={`${song.album} - ${song.artist}`}
            className="w-full h-full object-cover"
            priorityExtensions={getPriorityExtensions()}
            isPlaying={isPlaying}
          />
          
          {/* Overlay effect using new theme variables */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              background: `linear-gradient(135deg, transparent 60%, var(--glows-albumArtCard-color, transparent))`,
              opacity: 0.5
            }}
          ></div>
          
          {song.isNew && (
            <div 
              className="themed-button absolute top-2 right-2 pointer-events-none"
              style={{
                textShadow: `0 0 5px var(--buttons-active-glowColor)`
              }}
            >
              ✨ NEW
            </div>
          )}
          
          {/* Animation Switch */}
          <div className="absolute bottom-2 right-2 flex items-center gap-2 pointer-events-auto z-20">
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="themed-button flex items-center gap-2 cursor-pointer"
                >
                  {animationsEnabled ? (
                    <Video className="h-6 w-6" style={{ color: 'var(--navigation-hoverTextColor)' }} />
                  ) : (
                    <VideoOff className="h-6 w-6" style={{ color: 'var(--navigation-textColor)' }} />
                  )}
                  <Switch
                    checked={animationsEnabled}
                    onCheckedChange={setAnimationsEnabled}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent 
                className="z-50 rounded-lg p-2"
                style={{
                    background: `linear-gradient(135deg, var(--navigation-backgroundGradient-from), var(--navigation-backgroundGradient-to))`,
                    borderColor: 'var(--navigation-borderColor)',
                    borderWidth: 'var(--navigation-borderWidth)',
                    color: 'var(--navigation-textColor)'
                }}
              >
                <p className="font-semibold">Animaciones</p>
                <p className="text-xs mt-1">
                  {animationsEnabled ? 'Imágenes animadas' : 'Imágenes estáticas'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div 
            className="absolute inset-0 cursor-pointer z-0"
            onClick={handleAlbumArtClick}
          ></div>
          
        </div>
      </Card>
    </TooltipProvider>
  );
};
