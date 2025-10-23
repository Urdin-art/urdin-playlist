import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  // Protección anti-spam para el email
  const email = 'urdin.art' + '@' + 'gmail.com';

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="themed-card max-w-4xl mx-auto p-6 sm:p-8 prose" style={{ color: 'var(--text-headerFooter-normal)' }}>
        <h1 style={{ color: 'var(--text-headerFooter-highlighted)' }}>Términos y Condiciones</h1>
        
        <h2 style={{ color: 'var(--text-headerFooter-highlighted)' }}>Uso del contenido</h2>
        <p>
          Todas las canciones en esta plataforma son propiedad exclusiva de SYNAPTIC TRENDS AGENCY™,
          y de la persona real tras el pseudónimo UrDíN.art © {new Date().getFullYear()}. 
          Se autoriza a los usuarios del sitio la reproducción y descarga del contenido multimedia
          al que se ofrece acceso, únicamente para uso particular, disfrute personal y privado.
          Autorizo la libre promoción, mención y publicación en cualquier medio de la dirección
          o enlace web de este sitio siempre que no vayan acompañadas de ningun material audiovisual
          de los que este sitio contiene.
        </p>
        <h2 style={{ color: 'var(--text-headerFooter-highlighted)' }}>Permisos y licencias</h2>
        <p>
          Queda prohibido cualquier uso comercial, retransmisión, reproducción en público,
          distribución o publicación en cualquier medio sin autorización expresa por escrito.
          - Excepciones:
          Publicación a modo de cita o referencia:
          Se permite una captura de pantalla estática por publicación, sin manipular ni modificar.
          Se permite un único fragmento de audio de menos de 15 segundos de duración por canción
          accesible a través de este sitio, sólo si va exento de falacias, juicios, vejaciones,
          mensajes de odio o desprecio de cualquier tipo; y sólo si va acompañado de forma notable y
          reconocible de la dirección o enlace a este sitio; y únicamente si además de lo anterior,
          se comparte conmigo el acceso a una copia de la publicación, los detalles de uso o
          retransmisión, y su motivación o intención, mediante un mensaje con todos los datos a la
          siguiente dirección de correo electrónico: <span style={{ color: 'var(--text-headerFooter-highlighted)' }}>{email}</span>
        </p>

        <h2 style={{ color: 'var(--text-headerFooter-highlighted)' }}>Política de Cookies</h2>
        <p>
          Este sitio web utiliza cookies y tecnologías similares para mejorar tu experiencia de usuario, 
          analizar el tráfico del sitio y personalizar el contenido. Las cookies son pequeños archivos 
          de texto que se almacenan en tu dispositivo cuando visitas sitios como este, sobretodo los que
          permiten algún tipo de interacción con resultados persistentes o registran el tráfico.
        </p>
        
        <h3 style={{ color: 'var(--text-headerFooter-highlighted)' }}>Tipos de cookies que utiliza el sitio:</h3>
        <ul>
          <li><strong>Cookies esenciales:</strong> Son necesarias para el funcionamiento básico del sitio web. 
          Guardan tus preferencias en tu dispositivo para que no tengas que volver a ponerlo todo a tu gusto cuando
          vuelvas, como el orden que has elegido para las canciones y tu lista de reproducción personal, y recuerdan
          las canciones que has reproducido para poder resaltar las novedades.</li>
          <li><strong>Cookies de análisis:</strong> Me ayudan a entender cómo los visitantes interactúan con el sitio 
          mediante la recopilación de información completamente anónima. Utilizo servicios como PostHog para este fin.</li>
          <li><strong>Cookies de rendimiento:</strong> Recopilan información sobre cómo los visitantes utilizan 
          el sitio web, como qué secciones visitan con más frecuencia, las características que más se usan y si reciben
          mensajes de error de algún tipo, para poder corregir algún fallo que se me haya pasado por alto, y para saber
          qué partes vale la pena mejorar.</li>
        </ul>
        
        <h3 style={{ color: 'var(--text-headerFooter-highlighted)' }}>Tus opciones:</h3>
        <p>
          Puedes configurar tu navegador para que rechace todas las cookies o para que te avise cuando se guarden cookies.
          Sin embargo, si las deshabilitas, algunas partes del sitio web no funcionarán correctamente y perderás todas
          tus preferencias al salir.</p>
        <h3 style={{ color: 'var(--text-headerFooter-highlighted)' }}>¿Sólo eso?</h3>
        <p>
          Pues nada más, y nada menos que eso.
          Mis cookies son deliciosas e inofensivas, no tienen calorías, edulcorantes artificiales, ni azúcares añadidos,
          y nunca guardan ningún dato personal, ni se utilizan para mostrarte publicidad, o hacerte ningún seguimiento.
          No me interesa saber de tí nada que tú mismo no quieras compartir conmigo. Mis cookies sólo sirven para que yo
          pueda hacerme una idea de las visitas que recibo y para poder guardar todas tus preferencias personales
          en tu dispositivo. De esta forma el sitio recordará como estaba todo cuando te fuiste, el orden de las canciones
          que has elegido y tu lista de reproducción personal, y eso se queda entre tu dispositivo y el sitio solamente,
          yo no voy a acceder a ninguna de esa información (ni aunque supiera cómo hacerlo).</p>
        <h3 style={{ color: 'var(--text-headerFooter-highlighted)' }}>¿Es seguro?</h3>
        <p>
          Estas tecnologías pueden usarse para muchas cosas, muchos sitios las utilizan para rastrearte, saber que webs
          visitas o dónde haces clic, y utilizan esa información para elegir que anuncios mostrarte que te puedan interesar.
          Pueden confeccionar un perfil con tus costumbres y preferencias en cuanto a sitios y contenidos sin que tu lo sepas.
          Así que no, no siempre son totalmente seguras. Pero yo no tengo nada que venderte ni anuncios que me interese que 
          veas. Yo uso estas tecnologías solo dentro de mi sitio, me sirven para crear en tu navegador un espacio privado de
          memoria que persiste entre visitas, sin guardar datos online, solo en la privacidad de tu dispositivo, sin tener que
          introducir tus datos, ni registrarte, sin logins ni passwords, ni pedirte absolutamente ningúna información propia.
          Ni siquiera tienes que introducir tu email o tu nombre para enviarme un mensaje, hasta ahí llega mi compromiso con la
          privacidad de los usuarios. Aunque un superhacker consiguiera acceso total a mi página, solo encontraría mis canciones,
          el código del reproductor de música y mis tonterías. Aquí no se guarda nada vuestro, cero, nothing, res de res, todo
          se queda en vuestro navegador, podeis hacer una prueba si borrais los datos de navegación, la web os recibirá como si
          fuera la primera vez.</p>
        <h3 style={{ color: 'var(--text-headerFooter-highlighted)' }}>¿Es eso posible?</h3>
        <p>
          Todas estas funciones de personalización anónima son, en mi opinión, las mejores del sitio, que
          lo diferencian de todas las demás utilidades parecidas, y de las cosas que más trabajo me ha costado hacer funcionar
          bien, por lo que mi recomendación personal es que dejes las cookies activadas, que personalices tu experiencia aquí
          con confianza, y que disfrutes de mi música a través de esta utilidad que he creado con mucho esfuerzo, cariño, tiempo
          y cafeína para poder conectar contigo y compartir mis emociones e ideas mediante este arte que siempre he tenido
          encerrado dentro y que hoy por fin existen herramientas que me permiten liberarlo y compartirlo con el mundo.
        </p>
        <h3 style={{ color: 'var(--text-headerFooter-highlighted)' }}>Mi compromiso</h3>
        <p>
          Este sitio nunca te mostrará publicidad comercial de otras empresas, no intentará venderte nada de
          nada, ni te pedirá ningún dato personal para usarlo.
          Es un proyecto hecho con cariño, y sin ningún ánimo de lucro, para poder compartir mi música con mi
          familia de SYNAPTIC TRENDS, nuestros queridos colaboradores, mis Hermanos, mis amigos, los dioses,
          y con cualquiera capaz de sentir la magia imbuída en cada una de mis canciones, que se sienta
          identificado con el mensaje o las historias que cuento con mis letras, que le guste la emoción que le
          transmiten mis melodías, que le hagan pasar un rato agradable, que le den algo en que pensar, o que
          simplemente tenga curiosidad por saber un poco más de UrDiN.</p>
        <h3 style={{ color: 'var(--text-headerFooter-highlighted)' }}>¿Quién es UrDíN?</h3>
        <p>
          ¿Que quién es UrDíN? Sólo te diré una cosa. Si has escuchado mis canciones, seguramente ya me conoces mejor
          y más íntimamente que la mayoría de los que me hayan podido conocer en persona. Lo demás no tiene importancia.</p>
        <h3 style={{ color: 'var(--text-headerFooter-highlighted)' }}>¿Aceptas?</h3>
        <p>
          Al continuar utilizando este sitio web, aceptas el uso de cookies según esta política. 
          Cualquier cambio en esta política de cookies se publicará en esta página. Y puede que también te
          encuentres alguna sorpresa, así que si tienes curiosidad recuerda volver de vez en cuando.
          Y si no estás conforme, eres muy libre de pulsar la X en la pestaña o ventana, cerrar la aplicación, tirar el
          dispositivo a la basura (mejor recicla), apagarlo o usar cualquiera de la multitud de métodos que existen para que
          mi sitio desaparezca de tu vida. Sé creativo, pero que sepas que tú te lo pierdes.</p>
        <h3 style={{ color: 'var(--text-headerFooter-highlighted)' }}>¡Sorpresa! 🎁</h3>
        <p></p>
        <p>
          Y por haber llegado hasta aquí, te mereces el acceso a la ⚠️<strong><a href="/?config=X-side" style={{ color: 'var(--text-headerFooter-highlighted)' }}>CARA X</a></strong>⚠️, donde encontrarás
          mis experimentos más locos y divertidos.
          Mándame un saludito con el icono del sobrecito ✉️ de arriba para que sepa que lo encontraste. 😉</p>
        <p>
          Que el ☀️sol os ilumine, la 🌕luna os guarde, y el 🌳árbol os guíe.</p>

        <h2 style={{ color: 'var(--text-headerFooter-highlighted)' }}>Contacto</h2>
        <p>
          Para solicitudes de uso comercial o preguntas:<br />
          Email: <span style={{ color: 'var(--text-headerFooter-highlighted)' }}>{email}</span>
        </p>

        <div className="mt-8">
          <Button onClick={() => navigate(-1)} className="themed-button">
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Terms;