import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LyricsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lyricsFile: string | undefined;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({ isOpen, onOpenChange, lyricsFile }) => {
  const [lyrics, setLyrics] = useState<string>('');

  useEffect(() => {
    if (isOpen && lyricsFile) {
      fetch(lyricsFile)
        .then(response => response.text())
        .then(text => {
          const lines = text.split('\n').filter(line => !line.includes('-->') && line.trim() !== 'WEBVTT' && line.trim() !== '');
          setLyrics(lines.join('\n'));
        });
    }
  }, [isOpen, lyricsFile]);

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
          <DialogTitle className="text-center text-lg" style={{ color: 'var(--navigation-hoverTextColor)' }}>Letra</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto" style={{ whiteSpace: 'pre-wrap' }}>
          {lyrics}
        </div>
        <Button
          onClick={() => onOpenChange(false)}
          className="synthwave-button active"
        >
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
};
