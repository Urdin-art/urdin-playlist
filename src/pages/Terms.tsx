import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  // Protección anti-spam para el email
  const email = 'urdin.art' + '@' + 'gmail.com';

  return (
    <div className="container max-w-3xl py-8 prose">
      <h1>Términos y Condiciones</h1>
      
      <h2>Uso del contenido</h2>
      <p>
        Todas las canciones en esta plataforma son propiedad exclusiva de UrDíN © {new Date().getFullYear()}.
        Autorizo su reproducción y descarga únicamente para uso personal.
      </p>
      <p>
        Queda prohibido cualquier uso comercial, distribución o publicación sin 
        autorización expresa por escrito.
      </p>

      <h2>Contacto</h2>
      <p>
        Para solicitudes de uso comercial o preguntas:<br />
        Email: <span className="select-all">{email}</span>
      </p>

      <div className="mt-8">
        <Button onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    </div>
  );
};

export default Terms;
