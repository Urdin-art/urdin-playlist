import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUp, ArrowDown, Download, Star } from 'lucide-react';

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

interface PlaylistProps {
  title: string;
  songs: Song[];
  isActive: boolean;
  currentSongId?: string;
  onSongSelect: (songIndex: number) => void;
  onSongToggle: (songId: string) => void;
  onMoveUp?: (songId: string) => void;
  onMoveDown?: (songId: string) => void;
  onDownload?: (songId: string) => void;
}

export const Playlist: React.FC<PlaylistProps> = ({
  title,
  songs,
  isActive,
  currentSongId,
  onSongSelect,
  onSongToggle,
  onMoveUp,
  onMoveDown,
  onDownload,
}) => {
  const handleSongClick = (songIndex: number) => {
    if (isActive) {
      onSongSelect(songIndex);
    }
  };

  return (
    <Card className={`glass-effect p-4 ${isActive ? 'neon-border' : 'border-muted'}`}>
      <h2 className={`text-xl font-bold mb-4 ${isActive ? 'text-neon-pink' : 'text-muted-foreground'}`}>
        {title}
      </h2>
      
      <div className="space-y-2">
        {songs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-3xl mb-2">🎵</div>
            <p>Sin exclusiones</p>
          </div>
        ) : (
          songs.map((song, index) => (
            <div
              key={song.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
                ${currentSongId === song.id && isActive 
                  ? 'border-neon-pink bg-neon-pink/10' 
                  : 'border-muted hover:border-neon-cyan/50'
                }
                ${isActive ? 'cursor-pointer hover:bg-white/5' : 'opacity-50'}
              `}
              onClick={() => handleSongClick(index)}
            >
              {/* Checkbox */}
              <Checkbox
                checked={isActive}
                onCheckedChange={() => onSongToggle(song.id)}
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Album Art */}
              <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                <img
                  src={song.albumArt}
                  alt={song.album}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold truncate ${
                    currentSongId === song.id && isActive ? 'text-neon-pink' : 'text-foreground'
                  }`}>
                    {song.title}
                  </h3>
                  {song.isNew && (
                    <Star className="w-4 h-4 text-neon-orange shrink-0" fill="currentColor" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {song.artist} • {song.duration}
                </p>
              </div>

              {/* Controls */}
              {isActive && (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Move Up */}
                  {onMoveUp && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveUp(song.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-neon-cyan"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Move Down */}
                  {onMoveDown && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveDown(song.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-neon-cyan"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Download */}
                  {onDownload && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        onDownload(song.id);
                        window.goatcounter?.count({
                          path: `download-${encodeURIComponent(song.title)}`,
                          title: song.title,
                          event: true,
                        });
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-neon-purple"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
