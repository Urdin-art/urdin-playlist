import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface TermsBannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsBanner = ({ isOpen, onClose }: TermsBannerProps) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const navigate = useNavigate();

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const accepted = localStorage.getItem('termsAccepted');
    if (!accepted && !isOpen) { // Only open automatically if not already forced open by prop
      setInternalOpen(true);
    }
  }, [isOpen]);

  const handleAccept = () => {
    localStorage.setItem('termsAccepted', 'true');
    setInternalOpen(false);
    onClose();
  };

  const handleOpenChange = (openState: boolean) => {
    setInternalOpen(openState);
    if (!openState) {
      onClose();
    }
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Términos y Condiciones</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Al usar este sitio aceptas nuestros términos y condiciones.</p>
          <div className="flex gap-2">
            <Button onClick={handleAccept} className="flex-1">
              Aceptar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                navigate('/terms');
                onClose(); // Close the modal when navigating to terms page
              }} 
              className="flex-1"
            >
              Ver términos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
