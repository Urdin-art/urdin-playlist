import React, { useState, useEffect } from 'react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { MusicPlayer } from '@/components/MusicPlayer';
import { AlbumArt } from '@/components/AlbumArt';
import { LyricsDisplay } from '@/components/LyricsDisplay';
import { Playlist } from '@/components/Playlist';
import { Card } from '@/components/ui/card';
import { TermsBanner } from '@/components/TermsBanner';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const Index = () => {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install banner
      setShowInstallBanner(true);
      
      // Hide the banner after 5 seconds
      const timer = setTimeout(() => {
        setShowInstallBanner(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    };

    const handleAppInstalled = () => {
      console.log('appinstalled event fired');
      // Hide the install banner and icon
      setShowInstallBanner(false);
      setIsAppInstalled(true);
      // Clear the deferred prompt
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    console.log('Is app installed (standalone mode):', isStandalone);
    if (isStandalone) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // Clear the deferred prompt
        setDeferredPrompt(null);
        // Hide the banner
        setShowInstallBanner(false);
      });
    }
  };

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
      {/* PWA Install Banner */}
      {showInstallBanner && !isAppInstalled && (
        <div className="fixed top-0 left-0 right-0 bg-neon-pink text-white p-4 z-50 animate-slide-down">
          <div className="container mx-auto flex justify-between items-center">
            <p>Instala la aplicación UrDíN.art Music Player</p>
            <div className="flex space-x-2">
              <Button onClick={handleInstallClick} variant="secondary" size="sm">
                Instalar
              </Button>
              <Button onClick={() => setShowInstallBanner(false)} variant="ghost" size="sm">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

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
        {/* PWA Install Icon */}
        {!isAppInstalled && !showInstallBanner && (
          <div className="absolute top-4 right-4">
            <Button 
              onClick={handleInstallClick}
              variant="ghost" 
              size="icon"
              className="text-neon-cyan hover:text-neon-pink"
              aria-label="Instalar aplicación"
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Top Section: Album Art + Player Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Album Art */}
        <div className="lg:col-span-1 flex">
          <div className="w-full">
            {currentSong && <AlbumArt song={currentSong} />}
          </div>
        </div>

        {/* Player Controls */}
        <div className="lg:col-span-2 flex">
          <div className="w-full h-full flex flex-col">
            {activeSongs.length > 0 && (
              <MusicPlayer
                songs={activeSongs}
                currentSongIndex={currentSongIndex}
                onSongChange={setCurrentSongIndex}
                onSongEnd={markSongAsPlayed}
                onTimeUpdate={setCurrentTime}
                onPlayStateChange={setIsPlaying}
              />
            )}
          </div>
        </div>
      </div>

      {/* Lyrics Display */}
      {currentSong && (
        <LyricsDisplay
          lyricsFile={currentSong?.lyricsFile}
          currentTime={currentTime}
          isPlaying={isPlaying}
        />
      )}

      {/* Playlists Section */}
      {!isLoading && (
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
      )}

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
        {/* PWA Installation Note */}
        {isAppInstalled === false && showInstallBanner === false && (
          <p className="mt-2 text-xs text-muted-foreground">
            Si has instalado y desinstalado la aplicación previamente, es posible que el navegador no muestre la opción de instalación durante un tiempo. Puedes intentar instalarla manualmente desde el menú del navegador.
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
