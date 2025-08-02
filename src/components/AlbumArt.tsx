import React from 'react';
import { Card } from '@/components/ui/card';

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
}

export const AlbumArt: React.FC<AlbumArtProps> = ({ song }) => {
  if (!song) {
    return (
      <Card className="glass-effect neon-border aspect-square flex items-center justify-center">
        <div className="text-neon-cyan text-center">
          <div className="text-4xl mb-2">🎵</div>
          <p>No Song Selected</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-effect neon-border p-2 aspect-square">
      <div className="relative w-full h-full rounded-lg overflow-hidden">
        <img
          src={song.albumArt}
          alt={`${song.album} - ${song.artist}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        
        {/* Efecto de superposición synthwave */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-900/20"></div>
        
        {/* Indicador de canción nueva */}
        {song.isNew && (
          <div className="absolute top-2 right-2 bg-gradient-synthwave text-xs px-2 py-1 rounded-full font-bold">
            ✨ NEW
          </div>
        )}
        
        {/* Efecto de brillo en los bordes */}
        <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
      </div>
    </Card>
  );
};