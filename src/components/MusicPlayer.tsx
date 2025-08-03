import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2 } from 'lucide-react';

declare global {
  interface Window {
    goatcounter: {
      count: (options: {
        path: string;
        title: string;
        event: boolean;
      }) => void;
    };
  }
}

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

interface MusicPlayerProps {
  songs: Song[];
  currentSongIndex: number;
  onSongChange: (index: number) => void;
  onSongEnd: (songId: string) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  songs,
  currentSongIndex,
  onSongChange,
  onSongEnd,
  onTimeUpdate,
  onPlayStateChange,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [hasSentPlayEvent, setHasSentPlayEvent] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    // Cargar configuración desde localStorage
    const savedVolume = localStorage.getItem('musicPlayer_volume');
    const savedShuffle = localStorage.getItem('musicPlayer_shuffle');
    const savedRepeat = localStorage.getItem('musicPlayer_repeat');

    if (savedVolume) setVolume(parseFloat(savedVolume));
    if (savedShuffle) setIsShuffled(JSON.parse(savedShuffle));
    if (savedRepeat) setRepeatMode(savedRepeat as 'none' | 'all' | 'one');
  }, []);

  useEffect(() => {
    // Guardar configuración en localStorage
    localStorage.setItem('musicPlayer_volume', volume.toString());
    localStorage.setItem('musicPlayer_shuffle', JSON.stringify(isShuffled));
    localStorage.setItem('musicPlayer_repeat', repeatMode);
  }, [volume, isShuffled, repeatMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentSong) {
        onSongEnd(currentSong.id);
      }
      handleNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, onSongEnd]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const sendPlayEvent = useCallback(() => {
    window.goatcounter.count({
      path: `play-${encodeURIComponent(currentSong.title)}`, 
      title: currentSong.title,
      event: true,
    });
    setHasSentPlayEvent(true);
  }, [currentSong]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    } else {
      audio.play();
      setHasSentPlayEvent(false);
      playTimerRef.current = setTimeout(() => {
        if (audio.currentTime >= 30 && !hasSentPlayEvent) {
          sendPlayEvent();
        }
      }, 30000);
    }
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    onPlayStateChange?.(newPlayState);
  };

  const handleNext = () => {
    if (repeatMode === 'one') {
      // Repetir la canción actual
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIndex;
    if (isShuffled) {
      // Modo aleatorio
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (nextIndex === currentSongIndex && songs.length > 1);
    } else {
      // Modo secuencial
      nextIndex = currentSongIndex + 1;
      if (nextIndex >= songs.length) {
        nextIndex = repeatMode === 'all' ? 0 : currentSongIndex;
      }
    }

    if (nextIndex !== currentSongIndex) {
      onSongChange(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      // Si han pasado más de 3 segundos, reiniciar la canción actual
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    let prevIndex;
    if (isShuffled) {
      // Modo aleatorio
      do {
        prevIndex = Math.floor(Math.random() * songs.length);
      } while (prevIndex === currentSongIndex && songs.length > 1);
    } else {
      // Modo secuencial
      prevIndex = currentSongIndex - 1;
      if (prevIndex < 0) {
        prevIndex = repeatMode === 'all' ? songs.length - 1 : 0;
      }
    }

    onSongChange(prevIndex);
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <span className="text-xs absolute -top-1 -right-1">1</span>;
      case 'all':
        return null;
      default:
        return null;
    }
  };

  if (!currentSong) return null;

  return (
    <Card className="glass-effect neon-border p-6 h-full flex flex-col">
      <audio
        ref={audioRef}
        src={currentSong.audioFile}
        onLoadedData={() => {
          if (isPlaying && audioRef.current) {
            audioRef.current.play();
          }
        }}
      />
      
      {/* Información de la canción */}
      <div className="text-center mb-6">
        <h2 className="text-neon-pink text-xl font-bold mb-1">{currentSong.title}</h2>
        <p className="text-neon-cyan text-lg">{currentSong.artist}</p>
        <p className="text-muted-foreground">{currentSong.album}</p>
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controles principales */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="synthwave-button"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={togglePlay}
          className="synthwave-button h-12 w-12"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="synthwave-button"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Controles secundarios */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={`relative ${isShuffled ? 'text-neon-purple' : 'text-muted-foreground'}`}
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeat}
            className={`relative ${repeatMode !== 'none' ? 'text-neon-purple' : 'text-muted-foreground'}`}
          >
            <Repeat className="h-4 w-4" />
            {getRepeatIcon()}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </Card>
  );
};
