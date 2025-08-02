import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

export const TermsBanner = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accepted = localStorage.getItem('termsAccepted');
    if (!accepted) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('termsAccepted', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              onClick={() => navigate('/terms')} 
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
