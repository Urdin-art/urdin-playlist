import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Facebook, X, Mail, MessageSquare, Link } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  songTitle: string;
  songUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onOpenChange, songTitle, songUrl }) => {
  const text = `Escucha "${songTitle}" en Retro Beat Player!`;

  const copyLink = () => {
    navigator.clipboard.writeText(songUrl);
    toast.success("¡Enlace copiado al portapapeles!", {
      description: songUrl,
      classNames: {
        toast: 'glass-effect',
        title: 'text-primary-custom',
        description: 'text-dimmed',
      },
    });
  };

  const shareOptions = [
    { name: 'Facebook', icon: <Facebook />, action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(songUrl)}&quote=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer') },
    { name: 'X', icon: <X />, action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(songUrl)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer') },
    { name: 'WhatsApp', icon: <MessageSquare />, action: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + songUrl)}`, '_blank', 'noopener,noreferrer') },
    { name: 'Email', icon: <Mail />, action: () => window.location.href = `mailto:?subject=${encodeURIComponent(songTitle)}&body=${encodeURIComponent(text + ' ' + songUrl)}` },
    { name: 'Copiar Enlace', icon: <Link />, action: copyLink },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <DialogTitle className="text-center text-lg" style={{ color: 'var(--navigation-hoverTextColor)' }}>Compartir "{songTitle}"</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Comparte esta canción con tus amigos en tus redes sociales favoritas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="default"
              className="synthwave-button flex items-center justify-center gap-2"
              onClick={option.action}
            >
              {option.icon}
              {option.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};