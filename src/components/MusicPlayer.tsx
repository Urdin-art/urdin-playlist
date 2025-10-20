import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, Star, Download, VolumeX, PlayCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMediaSession } from '@/hooks/useMediaSession';
import { Song } from '@/types';

interface MusicPlayerProps {
  songs: Song[];
  currentSongIndex: number;
  onSongChange: (index: number) => void;
  onSongEnd: (songId: string) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  downloadSong: (songId: string) => void;
  personalPlaylist: string[];
  togglePersonalPlaylist: (songId: string) => void;
}

export const MusicPlayer = forwardRef<{ togglePlay: () => void }, MusicPlayerProps>(({
  songs,
  currentSongIndex,
  onSongChange,
  onSongEnd,
  onTimeUpdate,
  onPlayStateChange,
  downloadSong,
  personalPlaylist,
  togglePersonalPlaylist,
}, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playOnLoad, setPlayOnLoad] = useState(false);

  const currentSong = songs[currentSongIndex];

  const handleNext = useCallback(() => {
    if (repeatMode === 'one' && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        return;
    }
    let nextIndex;
    if (isShuffled) {
        const nextShuffleIndex = currentShuffleIndex + 1;
        if (nextShuffleIndex < shuffledIndices.length) {
            setCurrentShuffleIndex(nextShuffleIndex);
            nextIndex = shuffledIndices[nextShuffleIndex];
        } else {
            if (repeatMode === 'all') {
                setCurrentShuffleIndex(0);
                nextIndex = shuffledIndices[0];
            } else {
                nextIndex = currentSongIndex;
            }
        }
    } else {
        nextIndex = currentSongIndex + 1;
        if (nextIndex >= songs.length) {
            if (repeatMode === 'all') {
                nextIndex = 0;
            } else {
                nextIndex = currentSongIndex;
            }
        }
    }
    if (nextIndex !== currentSongIndex) {
        setPlayOnLoad(isAutoplay);
        onSongChange(nextIndex);
    }
  }, [currentSongIndex, currentShuffleIndex, isShuffled, onSongChange, repeatMode, shuffledIndices, songs.length, isAutoplay]);

  const handlePrevious = () => {
      if (audioRef.current && audioRef.current.currentTime > 3) {
          audioRef.current.currentTime = 0;
          return;
      }
      let prevIndex;
      if (isShuffled) {
          const prevShuffleIndex = currentShuffleIndex - 1;
          if (prevShuffleIndex >= 0) {
              setCurrentShuffleIndex(prevShuffleIndex);
              prevIndex = shuffledIndices[prevShuffleIndex];
          } else {
              if (repeatMode === 'all') {
                  const lastShuffleIndex = shuffledIndices.length - 1;
                  setCurrentShuffleIndex(lastShuffleIndex);
                  prevIndex = shuffledIndices[lastShuffleIndex];
              } else {
                  prevIndex = currentSongIndex;
              }
          }
      } else {
          prevIndex = currentSongIndex - 1;
          if (prevIndex < 0) {
              if (repeatMode === 'all') {
                  prevIndex = songs.length - 1;
              } else {
                  prevIndex = 0;
              }
          }
      }
      if (prevIndex !== currentSongIndex) {
          setPlayOnLoad(isAutoplay);
          onSongChange(prevIndex);
      }
  };

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(e => console.error("Error al reproducir:", e));
    } else {
      audio.pause();
    }
  }, []);

  useMediaSession(currentSong, {
    onPlay: togglePlay,
    onPause: togglePlay,
    onNext: handleNext,
    onPrev: handlePrevious,
  });

  useEffect(() => {
    const savedVolume = localStorage.getItem('musicPlayer_volume');
    const savedShuffle = localStorage.getItem('musicPlayer_shuffle');
    const savedRepeat = localStorage.getItem('musicPlayer_repeat');
    const savedAutoplay = localStorage.getItem('musicPlayer_autoplay');
    if (savedVolume) setVolume(parseFloat(savedVolume));
    if (savedShuffle) setIsShuffled(JSON.parse(savedShuffle));
    if (savedRepeat) setRepeatMode(savedRepeat as 'none' | 'all' | 'one');
    if (savedAutoplay) setIsAutoplay(JSON.parse(savedAutoplay));
  }, []);

  useEffect(() => {
    localStorage.setItem('musicPlayer_volume', volume.toString());
    localStorage.setItem('musicPlayer_shuffle', JSON.stringify(isShuffled));
    localStorage.setItem('musicPlayer_repeat', repeatMode);
    localStorage.setItem('musicPlayer_autoplay', JSON.stringify(isAutoplay));
  }, [volume, isShuffled, repeatMode, isAutoplay]);

  useEffect(() => {
    if (isShuffled) {
      const indices = songs.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
      setCurrentShuffleIndex(0);
    }
  }, [isShuffled, songs]);

  useEffect(() => {
    setCurrentTime(0);
  }, [currentSongIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
        setIsPlaying(true);
        onPlayStateChange?.(true);
    };
    const handlePause = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
    };
    const handleTimeUpdate = () => {
        if (!audio.seeking) {
            setCurrentTime(audio.currentTime);
            onTimeUpdate?.(audio.currentTime);
        }
    };
    const handleLoadedMetadata = () => {
        setDuration(audio.duration);
    };
    const handleEnded = () => {
        onSongEnd(currentSong.id);
        if (isAutoplay) {
            handleNext();
        }
    };
    const handleCanPlay = () => {
        if (playOnLoad) {
            audio.play().catch(e => console.error("Autoplay failed", e));
            setPlayOnLoad(false);
        }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentSong, isAutoplay, playOnLoad, handleNext, onSongEnd, onPlayStateChange, onTimeUpdate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useImperativeHandle(ref, () => ({ togglePlay }));

  const handleSeek = (value: number[]) => {
    if (audioRef.current) audioRef.current.currentTime = value[0];
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <Card className="glass-effect p-10 h-full flex flex-col justify-between relative border-none" style={{ borderRadius: 'var(--playerCard-border-radius)', border: 'none' }}>
       <div className="absolute top-4 left-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="default" size="icon" onClick={() => togglePersonalPlaylist(currentSong.id)} className={`synthwave-button-gradient h-10 w-10 ${personalPlaylist.includes(currentSong.id) ? 'play-button-active' : ''}`}>
              <Star className={`h-5 w-5 ${personalPlaylist.includes(currentSong.id) ? 'fill-current' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>{personalPlaylist.includes(currentSong.id) ? 'Eliminar de Mi Lista' : 'Añadir a Mi Lista'}</p></TooltipContent>
        </Tooltip>
      </div>
      <div className="absolute top-4 right-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="default" size="icon" onClick={() => downloadSong(currentSong.id)} className="synthwave-button-gradient h-10 w-10">
              <Download className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left"><p>Descargar en MP3</p></TooltipContent>
        </Tooltip>
      </div>
      
      <audio ref={audioRef} src={currentSong.audioFile} />
      
      <div className="text-center flex-grow flex flex-col justify-center pt-8">
        <h2 className="text-2xl font-bold mb-1 text-player-title">{currentSong.title}</h2>
        <p className="text-xl text-player-artist">{currentSong.artist}</p>
        <p className="text-lg text-player-album mb-4">{currentSong.album}</p>
      </div>

      <div className="mt-auto mb-6">
        <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleSeek} className="w-full" />
        <div className="flex justify-between text-sm text-player-timestamp mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevious} className="synthwave-button-gradient"><SkipBack className="h-4 w-4" /></Button>
        <Button variant="default" size="icon" onClick={togglePlay} className={`synthwave-button-gradient h-16 w-16 ${isPlaying ? 'play-button-active' : ''}`} disabled={isBuffering}>
          {isBuffering ? <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"></div> : isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNext} className="synthwave-button-gradient"><SkipForward className="h-4 w-4" /></Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="glass-effect p-2 opacity-80 hover:opacity-100 transition-all duration-300 shadow-lg hover-glow rounded-lg flex items-center border-none">
                <Switch id="autoplay-switch" checked={isAutoplay} onCheckedChange={setIsAutoplay}>
                  <PlayCircle className="h-5 w-5" />
                </Switch>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Autoplay</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="icon" onClick={toggleShuffle} className={`relative synthwave-button-gradient ${isShuffled ? 'play-button-active' : ''}`}>
                <Shuffle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Aleatorio</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="icon" onClick={toggleRepeat} className={`relative synthwave-button-gradient ${repeatMode !== 'none' ? 'play-button-active' : ''}`}>
                <Repeat className="h-4 w-4" />
                {repeatMode === 'one' && <span className="text-xs absolute -top-1 -right-1">1</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>
                Repetir: {
                  repeatMode === 'none' ? 'nada' :
                  repeatMode === 'all' ? 'todo' : 'uno'
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="icon" onClick={toggleMute} className={`synthwave-button-gradient ${!isMuted ? 'play-button-active' : ''}`}>
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>{isMuted ? 'Quitar silencio' : 'Silenciar'}</p></TooltipContent>
          </Tooltip>
          <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className={`w-20 transition-opacity duration-300 ${isMuted ? 'opacity-50' : ''}`} />
        </div>
      </div>
    </Card>
  );
});

MusicPlayer.displayName = 'MusicPlayer';
