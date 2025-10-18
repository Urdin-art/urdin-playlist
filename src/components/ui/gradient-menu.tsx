import React, { useState, useEffect } from 'react';
import { IoHomeOutline, IoMusicalNotesOutline, IoMailOutline, IoDocumentTextOutline, IoDownloadOutline, IoPersonCircleOutline } from 'react-icons/io5';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ContactForm } from '@/components/ContactForm';
import { TermsBanner } from '@/components/TermsBanner';

interface PlaylistItem {
  title: string;
  config: string;
}

interface PlaylistData {
  playlists: PlaylistItem[];
}

const PlaylistsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/playlists.json')
        .then((response) => response.json())
        .then((data: PlaylistData) => setPlaylists(data.playlists));
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        style={{
          background: `linear-gradient(var(--navigation-backgroundGradient-angle, 135deg), var(--navigation-backgroundGradient-from), var(--navigation-backgroundGradient-to))`,
          borderColor: 'var(--navigation-borderColor)',
          borderWidth: 'var(--navigation-borderWidth)',
          color: 'var(--navigation-textColor)'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-lg" style={{ color: 'var(--navigation-hoverTextColor)' }}>Playlists</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2">
          {playlists.map((playlist) => (
            <li key={playlist.config}>
              <a href={`/?config=${playlist.config}-side`} className="block p-2 rounded-md hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200">
                {playlist.title}
              </a>
            </li>
          ))}
        </ul>
        <Button
          onClick={onClose}
          className="synthwave-button active"
        >
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default function GradientMenu() {
  const [isPlaylistsModalOpen, setPlaylistsModalOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isTermsModalOpen, setTermsModalOpen] = useState(false);

  const handleInstallClick = () => {
    // Logic to trigger PWA installation
    // This will be handled by a function passed via props or a global event
    window.dispatchEvent(new Event('pwa-install-triggered'));
  };

  const menuItems = [
    { title: 'Inicio', icon: <IoHomeOutline />, action: () => window.location.href = '/', gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
    { title: 'Mi lista', icon: <IoPersonCircleOutline />, action: () => window.location.href = '/?config=my-side', gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
    { title: 'Listas', icon: <IoMusicalNotesOutline />, action: () => setPlaylistsModalOpen(true), gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
    { title: 'Contacto', icon: <IoMailOutline />, action: () => setContactModalOpen(true), gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
    { title: 'Instalar', icon: <IoDownloadOutline />, action: handleInstallClick, gradientFrom: '#a955ff', gradientTo: '#ea51ff' }
  ];

  return (
    <>
      <div className="fixed left-1/2 -translate-x-1/2 z-40" style={{ top: '1rem' }}>
        <ul className="flex gap-2 md:gap-6">
          {menuItems.map(({ title, icon, gradientFrom, gradientTo, action }, idx) => (
            <li
              key={idx}
              style={{ 
                '--gradient-from': gradientFrom, 
                '--gradient-to': gradientTo,
                background: 'linear-gradient(to bottom, var(--menu-button-gradient-color), rgba(0, 0, 0, 0.85))'
              }}
              className="relative w-[1.875rem] h-[1.875rem] md:w-[2.8125rem] md:h-[2.8125rem] shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[5.625rem] md:hover:w-[8.4375rem] hover:shadow-none group cursor-pointer"
              onClick={action}
            >
              {/* Gradient background on hover */}
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
              {/* Blur glow */}
              <span className="absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>

              {/* Icon */}
              <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0">
                <span className="text-xl md:text-2xl" style={{ color: 'var(--menu-text-color)' }}>{icon}</span>
              </span>

              {/* Title */}
              <span className="absolute uppercase tracking-wide text-sm md:text-base font-bold transition-all duration-500 scale-0 group-hover:scale-100 delay-150" style={{ color: 'var(--menu-text-color)' }}>
                {title}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <PlaylistsModal isOpen={isPlaylistsModalOpen} onClose={() => setPlaylistsModalOpen(false)} />
      <ContactForm isOpen={isContactModalOpen} onOpenChange={setContactModalOpen} />
      <TermsBanner isOpen={isTermsModalOpen} onClose={() => setTermsModalOpen(false)} />
    </>
  );
}