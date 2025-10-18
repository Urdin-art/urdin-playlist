// --- START OF FILE ContactForm.tsx ---

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react'; // Importamos un icono de carga

// Definimos las propiedades del componente
interface ContactFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Creamos un pequeño componente para el diálogo de éxito para mantener el código limpio
function SuccessDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <DialogTitle className="text-center text-lg" style={{ color: 'var(--navigation-hoverTextColor)' }}>¡Mensaje Enviado!</DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm">
          Muchas gracias por tu mensaje. Lo he recibido correctamente.
        </p>
        <Button 
          onClick={() => onOpenChange(false)}
          className="synthwave-button active"
        >
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function ContactForm({ isOpen, onOpenChange }: ContactFormProps) {
  // Estado para controlar si se muestra el diálogo de éxito
  const [showSuccess, setShowSuccess] = useState(false);
  // Estado para controlar el estado de carga mientras se envía el formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // La función que manejará el envío del formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // 1. Prevenimos el comportamiento por defecto del formulario
    event.preventDefault();
    setIsSubmitting(true); // Mostramos el estado de carga

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      // 2. Usamos fetch para enviar los datos en segundo plano a FormSubmit
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json' // Clave para que FormSubmit devuelva JSON
        }
      });

      // 3. Si todo fue bien...
      if (response.ok) {
        onOpenChange(false); // Cerramos el modal del formulario
        setShowSuccess(true); // Abrimos el modal de éxito
        form.reset(); // Limpiamos el formulario
      } else {
        // Si hubo un error en el servidor, mostramos una alerta
        alert('Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      // Si hubo un error de red
      console.error('Error al enviar el formulario:', error);
      alert('Hubo un problema de conexión. Revisa tu conexión a internet.');
    } finally {
      setIsSubmitting(false); // Ocultamos el estado de carga
    }
  };

  return (
    <>
      {/* --- MODAL DEL FORMULARIO --- */}
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
          <DialogTitle className="text-center text-lg" style={{ color: 'var(--navigation-hoverTextColor)' }}>Escríbeme</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-center text-sm">
            Cualquier feedback, opinión, consejo o crítica son bienvenidos. 
            Ten en cuenta que, además, tu mensaje será totalmente anónimo; 
            no sabré quién eres ni cómo hacerte llegar mi respuesta 
            si no incluyes cómo contactarte en el mismo mensaje.
          </p>
            <form 
              action="https://formsubmit.co/ace93b9e8a91e5563f0087126fe6ff51" 
              method="POST"
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="_captcha" value="false" />
              <Textarea 
                placeholder="Tu mensaje" 
                className="w-full p-2 text-white rounded-md"
                style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid var(--navigation-separatorColor)`
                }}
                name="message" 
                rows={10} 
                required
                disabled={isSubmitting} // Deshabilitamos el textarea mientras se envía
              />
              <Button 
                type="submit" 
                className="synthwave-button active flex items-center justify-center gap-2"
                disabled={isSubmitting} // Deshabilitamos el botón mientras se envía
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  'Enviar mensaje'
                )}
              </Button>
            </form>
        </div>
      </DialogContent>
      </Dialog>
      
      {/* --- MODAL DE ÉXITO --- */}
      {/* Este diálogo se mostrará solo cuando showSuccess sea true */}
      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} />
    </>
  );
}