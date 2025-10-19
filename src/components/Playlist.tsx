import React from 'react';
import { toast } from "sonner";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUp, ArrowDown, Download, Star, Flame, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ImageLoader } from './ImageLoader';
import { Song, AppConfig } from '@/types';
import { ShareModal } from './ShareModal';
import { LyricsModal } from './LyricsModal';

interface PlaylistProps {
  title: string;
  songs: Song[];
  isActive: boolean;
  currentSongId?: string;
  onSongSelect: (songIndex: number, play: boolean) => void;
  onSongToggle: (songId: string) => void;
  onMoveUp?: (songId: string) => void;
  onMoveDown?: (songId: string) => void;
  onMoveToStart?: (songId: string) => void;
  onMoveToEnd?: (songId: string) => void;
  onDownload?: (songId: string) => void;
  config: AppConfig | null;
  switchConfig: (configName: string) => void;
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
  onMoveToStart,
  onMoveToEnd,
  onDownload,
  config,
  switchConfig,
}) => {
  const [personalPlaylist, setPersonalPlaylist] = React.useState<string[]>([]);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [songToShare, setSongToShare] = React.useState<{ title: string; url: string } | null>(null);
  const [isLyricsModalOpen, setIsLyricsModalOpen] = React.useState(false);
  const [selectedLyricsFile, setSelectedLyricsFile] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const storedPlaylist = JSON.parse(localStorage.getItem('personal_playlist') || '[]');
    setPersonalPlaylist(storedPlaylist);
  }, []);

  const togglePersonalPlaylist = (songId: string) => {
    const updatedPlaylist = personalPlaylist.includes(songId)
      ? personalPlaylist.filter(id => id !== songId)
      : [...personalPlaylist, songId];
    
    setPersonalPlaylist(updatedPlaylist);
    localStorage.setItem('personal_playlist', JSON.stringify(updatedPlaylist));
  };

  const openSongInNewTab = (songId: string) => {
    const url = new URL(window.location.origin);
    url.searchParams.set('config', 'single-side');
    url.searchParams.set('song', songId);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  const handleSongClick = (songIndex: number) => {
    if (isActive) {
      onSongSelect(songIndex, true); // Indicar que se debe reproducir
    }
  };

  const openShareModal = (song: Song) => {
    const url = new URL(window.location.origin);
    url.searchParams.set('config', 'single-side');
    url.searchParams.set('song', song.id);
    setSongToShare({ title: song.title, url: url.toString() });
    setShareModalOpen(true);
  };

  return (
    <>
      {songToShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onOpenChange={setShareModalOpen}
          songTitle={songToShare.title}
          songUrl={songToShare.url}
        />
      )}
      <LyricsModal
        isOpen={isLyricsModalOpen}
        onOpenChange={setIsLyricsModalOpen}
        lyricsFile={selectedLyricsFile}
      />
      <Card className={`p-4 h-full flex flex-col bg-transparent border-none shadow-none ${!isActive ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold`}
            style={{ color: 'var(--text-playlist-title)' }}
        >
          {title}
        </h2>
        {config?.personal_list_button?.enabled && isActive && (
          <Button
            id="my-list-button"
            className="synthwave-button"
            onClick={() => switchConfig(config.personal_list_button.targetConfig || 'my-side')}
          >
            <Star className="w-5 h-5 mr-2" />
            Mi lista
          </Button>
        )}
        {config?.refresh_button?.enabled && isActive && (
          <Button
            className="synthwave-button"
            onClick={() => window.location.reload()}
          >
            Aplicar cambios
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {songs.length === 0 ? (
          isActive && config?.storage === 'my-side' ? (
            <div className="text-center py-8 px-4" style={{ color: 'var(--text-playlist-secondary)' }}>
              <div className="text-3xl mb-4">
                <Star className="inline-block w-8 h-8" style={{ color: 'var(--text-playlist-icons)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-playlist-title)' }}>Tu lista personal está vacía</h3>
              <p>
                Añade tus canciones favoritas haciendo clic en su <Star className="inline-block w-4 h-4" style={{ color: 'var(--text-playlist-icons)' }} />.
              </p>
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--text-playlist-secondary)' }}>
              <div className="text-3xl mb-2">🎶</div>
              <p>{isActive ? 'No hay canciones en la lista.' : 'Sin exclusiones'}</p>
            </div>
          )
        ) : (
          songs.map((song, index) => (
            <div
              key={song.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all duration-300 playlist-item
                ${isActive ? 'cursor-pointer interactive-card' : ''}
                ${currentSongId === song.id && isActive ? 'playlist-item-active' : ''}
              `}
              style={{
                borderStyle: 'solid',
                borderColor: 'var(--borders-playlistItem-color)',
                borderWidth: 'var(--borders-playlistItem-width)',
                borderRadius: 'var(--borders-playlistItem-radius)',
              }}
              onClick={() => handleSongClick(index)}
            >
              <div className="flex flex-col items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                {config?.use_exclusions && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox
                        checked={isActive}
                        onCheckedChange={() => onSongToggle(song.id)}
                        style={{ color: 'var(--text-playlist-icons)' }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{isActive ? 'Excluir de la lista' : 'Incluir en la lista'}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        togglePersonalPlaylist(song.id);
                        if (config?.storage === 'my-side') {
                          onSongToggle(song.id);
                        }
                      }}
                      className={`h-8 w-8 star-button`}
                      style={{ color: personalPlaylist.includes(song.id) ? 'var(--text-playlist-icons)' : 'var(--text-playlist-secondary)' }}
                    >
                      <Star className={`h-4 w-4 ${personalPlaylist.includes(song.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{personalPlaylist.includes(song.id) ? 'Eliminar de Mi Lista' : 'Añadir a Mi Lista'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                <ImageLoader
                  basePath={song.albumArt.replace(/\.[^/.]+$/, "")}
                  alt={song.album}
                  className="w-full h-full object-cover"
                  priorityExtensions={['png', 'jpg']}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold truncate`}
                      style={{ color: currentSongId === song.id && isActive ? 'var(--text-playlist-title-active)' : 'var(--text-playlist-title)' }}
                  >
                    {song.title}
                  </h3>
                  {song.isNew && (
                    <Flame className="w-4 h-4 shrink-0" style={{ color: 'var(--text-playlist-icons)' }} fill="currentColor" />
                  )}
                </div>
                <p className="text-sm truncate" style={{ color: 'var(--text-playlist-secondary)' }}>
                  {song.artist} • {song.duration}
                </p>
              </div>

              {isActive && (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col">
                    {onMoveUp && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onMoveUp(song.id)}
                            className="synthwave-button h-6 w-6 synthwave-icon-button"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Subir</p></TooltipContent>
                      </Tooltip>
                    )}
                    {onMoveDown && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onMoveDown(song.id)}
                            className="synthwave-button h-6 w-6 synthwave-icon-button"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Bajar</p></TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="synthwave-button h-6 w-6 synthwave-icon-button"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        style={{
                            background: `linear-gradient(var(--navigation-backgroundGradient-angle, 135deg), var(--navigation-backgroundGradient-from), var(--navigation-backgroundGradient-to))`,
                            borderColor: 'var(--navigation-borderColor)',
                            borderWidth: 'var(--navigation-borderWidth)',
                            color: 'var(--navigation-textColor)',
                            borderRadius: 'var(--borders-menu-radius)'
                        }}
                    >

                      {onMoveToStart && <DropdownMenuItem onClick={() => onMoveToStart(song.id)} style={{ '--hover-color': 'var(--navigation-hoverItemColor)' } as React.CSSProperties}>Mover al principio</DropdownMenuItem>}
                      {onMoveToEnd && <DropdownMenuItem onClick={() => onMoveToEnd(song.id)} style={{ '--hover-color': 'var(--navigation-hoverItemColor)' } as React.CSSProperties}>Mover al final</DropdownMenuItem>}
                      {onDownload && <DropdownMenuItem onClick={() => onDownload(song.id)} style={{ '--hover-color': 'var(--navigation-hoverItemColor)' } as React.CSSProperties}>Descargar MP3</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => openSongInNewTab(song.id)} style={{ '--hover-color': 'var(--navigation-hoverItemColor)' } as React.CSSProperties}>Abrir canción</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openShareModal(song)} style={{ '--hover-color': 'var(--navigation-hoverItemColor)' } as React.CSSProperties}>Compartir</DropdownMenuItem>
                      {song.lyricsFile && <DropdownMenuItem onClick={() => { setSelectedLyricsFile(song.lyricsFile); setIsLyricsModalOpen(true); }} style={{ '--hover-color': 'var(--navigation-hoverItemColor)' } as React.CSSProperties}>Ver la letra</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
    </>
  );
};