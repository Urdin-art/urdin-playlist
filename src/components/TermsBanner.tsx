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
      <DialogContent 
        className="w-[95%] max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl"
        style={{
          background: `linear-gradient(var(--navigation-backgroundGradient-angle, 135deg), var(--navigation-backgroundGradient-from), var(--navigation-backgroundGradient-to))`,
          borderColor: 'var(--navigation-borderColor)',
          borderWidth: 'var(--navigation-borderWidth)',
          color: 'var(--navigation-textColor)'
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--navigation-hoverTextColor)' }} className="text-xl">Términos y Condiciones</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Al usar este sitio aceptas nuestros términos y condiciones.</p>
          
          <div 
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: `1px solid var(--navigation-separatorColor)`
            }}
          >
            <h4 className="font-semibold mb-2" style={{ color: 'var(--navigation-hoverTextColor)' }}>Política de Cookies</h4>
            <p className="text-sm mb-3">
              Este sitio utiliza cookies propias y de terceros para fines analíticos y de rendimiento. 
              Las cookies nos ayudan a entender cómo interactúas con nuestro sitio y a mejorar tu experiencia.
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Cookies esenciales para el funcionamiento básico del sitio</li>
              <li>Cookies de análisis para recopilar información estadística anónima</li>
              <li>Cookies de rendimiento para optimizar la velocidad y experiencia</li>
            </ul>
            <p className="text-sm mt-3">
              Al continuar usando este sitio, aceptas el uso de cookies según nuestra política. 
              Puedes gestionar tus preferencias de cookies en la configuración de tu navegador.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAccept} className="synthwave-button active">
              Aceptar términos y política de cookies
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                navigate('/terms');
                onClose(); // Close the modal when navigating to terms page
              }} 
              className="synthwave-button"
            >
              Ver términos completos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
