import React, { useState } from 'react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { MusicPlayer } from '@/components/MusicPlayer';
import { AlbumArt } from '@/components/AlbumArt';
import { LyricsDisplay } from '@/components/LyricsDisplay';
import { Playlist } from '@/components/Playlist';
import { Card } from '@/components/ui/card';
import { TermsBanner } from '@/components/TermsBanner';

const Index = () => {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const {
    activeSongs,
    excludedSongs,
    currentSongIndex,
    currentSong,
    currentTime,
    isPlaying,
    isLoading,
    setCurrentSongIndex,
    setCurrentTime,
    setIsPlaying,
    markSongAsPlayed,
    toggleSongPlaylist,
    moveSongUp,
    moveSongDown,
    downloadSong,
  } = useMusicPlayer();


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-effect neon-border p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-neon-cyan text-xl font-bold">Cargando <span className="italic">UrDíN.art</span> music player...</h2>
            <p className="text-muted-foreground mt-2">Inicializando sistemas de audio</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-6">
      <TermsBanner isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4">
          <img 
            src="/logo.png" 
            alt="UrDíN.art Logo"
            className="w-[100px] h-[100px]"
          />
          <h1 className="text-4xl font-bold bg-gradient-synthwave bg-clip-text">
            Music Player
          </h1>
        </div>
        <p className="text-neon-cyan">Escucha siempre las últimas versiones</p>
      </div>

      {/* Top Section: Album Art + Player Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Album Art */}
        <div className="lg:col-span-1 flex">
          <div className="w-full">
            <AlbumArt song={currentSong} />
          </div>
        </div>

        {/* Player Controls */}
        <div className="lg:col-span-2 flex">
          <div className="w-full">
            <MusicPlayer
              songs={activeSongs}
              currentSongIndex={currentSongIndex}
              onSongChange={setCurrentSongIndex}
              onSongEnd={markSongAsPlayed}
              onTimeUpdate={setCurrentTime}
              onPlayStateChange={setIsPlaying}
            />
          </div>
        </div>
      </div>

      {/* Lyrics Display */}
      <LyricsDisplay
        lyricsFile={currentSong?.lyricsFile}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />

      {/* Playlists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Playlist */}
        <Playlist
          title="Lista de reproducción"
          songs={activeSongs}
          isActive={true}
          currentSongId={currentSong?.id}
          onSongSelect={setCurrentSongIndex}
          onSongToggle={toggleSongPlaylist}
          onMoveUp={moveSongUp}
          onMoveDown={moveSongDown}
          onDownload={downloadSong}
        />

        {/* Excluded Songs */}
        <Playlist
          title="Exclusiones"
          songs={excludedSongs}
          isActive={false}
          onSongSelect={() => {}} // No action for excluded songs
          onSongToggle={toggleSongPlaylist}
        />
      </div>

      {/* Footer */}
      <div className="text-center text-muted-foreground text-sm">
        <p>🎵 _UrDiN.art_ Music Player • Hecho con Inteligencia Natural, y un poco de la Artificial 🎵</p>
        <p className="mt-2">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setIsTermsModalOpen(true);
            }} 
            className="text-neon-cyan hover:underline"
          >
            Ver Términos y Condiciones
          </a>
        </p>
      </div>
    </div>
  );
};

export default Index;
