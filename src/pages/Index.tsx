import React, { useState, useEffect, useRef } from 'react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useAppConfig } from '@/hooks/useAppConfig';
import { MusicPlayer } from '@/components/MusicPlayer';
import { AlbumArt } from '@/components/AlbumArt';
import { LyricsDisplay } from '@/components/LyricsDisplay';
import { Playlist } from '@/components/Playlist';
import { Card } from '@/components/ui/card';
import { TermsBanner } from '@/components/TermsBanner';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { LogoLoader } from '@/components/LogoLoader';
import GradientMenu from '@/components/ui/gradient-menu';

const Index = () => {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const musicPlayerRef = useRef<{ togglePlay: () => void } | null>(null);
  const { config, switchConfig } = useAppConfig();

  // Función para manejar el play/pause desde el albumart
  const handleAlbumArtPlayPause = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.togglePlay();
    }
  };

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      const installBannerDismissed = localStorage.getItem('install_banner_dismissed') === 'true';
      if (installBannerDismissed) return;

      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
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

  // Efecto para manejar la apertura de modales desde eventos globales
  useEffect(() => {
    const openTerms = () => setIsTermsModalOpen(true);
    const openContact = () => setIsContactFormOpen(true);

    window.addEventListener('open-terms-modal', openTerms);
    window.addEventListener('open-contact-modal', openContact);

    return () => {
      window.removeEventListener('open-terms-modal', openTerms);
      window.removeEventListener('open-contact-modal', openContact);
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
    moveSongToStart,
    moveSongToEnd,
    downloadSong,
    personalPlaylist,
    togglePersonalPlaylist,
  } = useMusicPlayer();

  useEffect(() => {
    if (currentSong) {
      // Actualizar el título del documento
      document.title = `${currentSong.title} - UrDíN.art`;

      // Actualizar metaetiquetas para redes sociales
      const updateMetaTag = (property: string, content: string) => {
        let element = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement;
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', property);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      const imageUrl = `${window.location.origin}${currentSong.albumArt}`;
      updateMetaTag('og:title', currentSong.title);
      updateMetaTag('og:description', `${currentSong.artist} - ${currentSong.album}`);
      updateMetaTag('og:image', imageUrl);
      updateMetaTag('twitter:title', currentSong.title);
      updateMetaTag('twitter:description', `${currentSong.artist} - ${currentSong.album}`);
      updateMetaTag('twitter:image', imageUrl);
    }
  }, [currentSong]);

  // Función para procesar el tagline con variables dinámicas
  const processTagline = (tagline: string): string => {
    if (!tagline) return "";
    let processed = tagline;
    if (currentSong) {
      processed = processed.replace(/\{CURRENT_SONG_TITLE\}/g, currentSong.title);
    }
    processed = processed.replace(/\{CURRENT_URL\}/g, window.location.href);
    // Limpiar marcadores no reemplazados
    processed = processed.replace(/\{[A-Z_]+\}/g, '');
    return processed;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-effect p-8 card-glow">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold gradient-text-primary">Cargando <span className="italic text-secondary-custom">UrDíN.art</span> music player...</h2>
            <p className="text-dimmed mt-2">Inicializando sistemas de audio</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <GradientMenu />
      <div className="min-h-screen space-y-12 lg:space-y-[4.5rem] pb-4 px-6 sm:px-12 lg:px-[4.5rem]">
        <div className="h-8" />

      {/* PWA Install Banner */}
      {showInstallBanner && !isAppInstalled && (
        <div className="fixed top-0 left-20 right-20 glass-effect p-4 z-50 animate-slide-down">
          <div className="container mx-auto flex justify-between items-center">
            <p className="font-semibold text-primary-custom">Instala la aplicación UrDíN.art Music Player</p>
            <div className="flex space-x-2">
              <Button onClick={handleInstallClick} variant="secondary" size="sm" className="synthwave-button">
                Instalar
              </Button>
              <Button
                onClick={() => {
                  setShowInstallBanner(false);
                  localStorage.setItem('install_banner_dismissed', 'true');
                }}
                variant="ghost"
                size="sm"
                className="text-dimmed hover:text-primary-custom"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <TermsBanner isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
      <ContactForm isOpen={isContactFormOpen} onOpenChange={setIsContactFormOpen} />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-4xl gradient-text-primary">
            🎵
          </h1>
           <LogoLoader 
            alt="UrDíN.art Logo"
            className="w-auto h-auto"
          />
          <h1 className="text-4xl gradient-text-primary">
            🎵
          </h1>
        </div>
        <div className="flex items-center justify-center gap-2">
          {config?.tagline && <p className="text-dimmed">{processTagline(config.tagline)}</p>}
          {config?.tagline_html && (
            <p
              className="text-dimmed"
              dangerouslySetInnerHTML={{ __html: processTagline(config.tagline_html) }}
            />
          )}
        </div>
      </div>

      {/* Top Section: Album Art + Player Controls */}
      <div className="flex flex-col xl:flex-row gap-12 lg:gap-[4.5rem] items-stretch">
        {/* Album Art */}
        <div className="w-full xl:w-1/3 theme-album-art-card aspect-square max-w-[500px] max-h-[500px] mx-auto overflow-hidden" style={{ zIndex: 1 }}>
          {currentSong && (
            <AlbumArt
              song={currentSong}
              isPlaying={isPlaying}
              onPlayPause={handleAlbumArtPlayPause}
            />
          )}
        </div>

        {/* Player Controls */}
        <div className="w-full xl:flex-1 flex theme-player-card" style={{ zIndex: 1 }}>
          <div className="w-full h-full flex flex-col">
            {activeSongs.length > 0 && (
              <MusicPlayer
                ref={musicPlayerRef}
                songs={activeSongs}
                currentSongIndex={currentSongIndex}
                onSongChange={(index) => setCurrentSongIndex(index)}
                onSongEnd={markSongAsPlayed}
                onTimeUpdate={setCurrentTime}
                onPlayStateChange={setIsPlaying}
                onPlayPause={handleAlbumArtPlayPause}
                downloadSong={downloadSong}
                personalPlaylist={personalPlaylist}
                togglePersonalPlaylist={togglePersonalPlaylist}
              />
            )}
          </div>
        </div>
      </div>

      {/* Lyrics Display */}
      {currentSong && (
        <div className="relative">
          {/* Static Glow */}
          <div 
            className="absolute inset-0"
            style={{
              borderRadius: 'var(--lyricsCard-borderRadius)',
              boxShadow: `0 0 var(--lyricsCard-glowSize, 0px) var(--lyricsCard-glowColor, transparent)`
            }}
          />
          {/* Animated Glow */}
          <div 
            className={`absolute inset-0 ${isPlaying ? "crt-glow-animated" : ""}`}
            style={{
              borderRadius: 'var(--lyricsCard-borderRadius)',
            }}
          />
          {/* Content */}
          <div className="relative" style={{ borderRadius: 'var(--lyricsCard-borderRadius)', overflow: 'hidden' }}>
            <LyricsDisplay
              lyricsFile={currentSong?.lyricsFile}
              currentTime={currentTime}
              isPlaying={isPlaying}
            />
            {/* Glass Effect Overlay */}
            <div
              className="absolute inset-2 pointer-events-none"
              style={{
                borderRadius: 'var(--lyricsCard-borderRadius)',
                background: 'linear-gradient(155deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 12.5%), linear-gradient(335deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 7.5%)',
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Playlists Section */}
      {!isLoading && config?.playlist && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-[4.5rem]">
          {/* Active Playlist */}
          <div className={`theme-playlist-card ${!config?.use_exclusions ? 'md:col-span-2' : ''}`}>
            <Playlist
              title="Lista de reproducción"
              songs={activeSongs}
              isActive={true}
              currentSongId={currentSong?.id}
              onSongSelect={(index, play) => {
                setCurrentSongIndex(index);
                if (play && musicPlayerRef.current) {
                  // Pequeño delay para asegurar que la nueva canción se carga antes de darle al play
                  setTimeout(() => musicPlayerRef.current?.togglePlay(), 50);
                }
              }}
              onSongToggle={toggleSongPlaylist}
              onMoveUp={moveSongUp}
              onMoveDown={moveSongDown}
              onMoveToStart={moveSongToStart}
              onMoveToEnd={moveSongToEnd}
              onDownload={downloadSong}
              config={config}
              switchConfig={switchConfig}
            />
          </div>

          {/* Excluded Songs */}
          {config?.use_exclusions && (
            <div className="theme-exclusions-card">
              <Playlist
                title="Exclusiones"
                songs={excludedSongs}
                isActive={false}
                onSongSelect={() => {}} // No action for excluded songs
                onSongToggle={toggleSongPlaylist}
                config={config}
                switchConfig={switchConfig}
              />
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-dimmed text-sm">
        <p className="text-dimmed"><a href="/?config=X-side" className="text-dimmed">🎵</a> _UrDiN.art_ Music Player • Hecho con Inteligencia Natural, y un poco de la Artificial <a href="/?config=X-side" className="text-dimmed">🎵</a></p>
        <p className="mt-2">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setIsTermsModalOpen(true);
            }} 
            className="text-highlighted hover:underline transition-colors duration-300"
          >
            Ver Términos y Condiciones
          </a>
        </p>
      </div>
    </div>
    </>
  );
};

export default Index;
