export default function Terminos() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--crema)', paddingTop: '80px' }}>

      {/* ── NAVBAR SIMPLE ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(250,246,240,.97)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--arena-dark)', padding: '.7rem 0',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--terracota)', textDecoration: 'none' }}>
            Luz Aldape
          </a>
          <a href="/" style={{ fontSize: '.82rem', color: '#9a7a60', textDecoration: 'none' }}>← Volver al inicio</a>
        </div>
      </nav>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        {/* Encabezado */}
        <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--arena-dark)' }}>
          <span style={{
            display: 'inline-block', fontSize: '.65rem', fontWeight: 700,
            letterSpacing: '.12em', textTransform: 'uppercase',
            color: 'var(--terracota)', background: 'rgba(160,82,45,.08)',
            padding: '.3rem .85rem', borderRadius: '2px', marginBottom: '1rem',
          }}>
            Documento legal
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700,
            color: 'var(--texto)', marginBottom: '.75rem', lineHeight: 1.2,
          }}>
            Términos y Condiciones
          </h1>
          <p style={{ fontSize: '.88rem', color: '#9a7a60', lineHeight: 1.7 }}>
            Última actualización: mayo de 2025 · Luz Aldape Tapices Artísticos · Puerto de Veracruz, Veracruz, México
          </p>
        </div>

        {/* Secciones */}
        {[
          {
            num: '1',
            titulo: 'Aceptación de los términos',
            contenido: [
              'Al acceder y utilizar el sitio web de Luz Aldape Tapices Artísticos (en adelante "el Sitio"), usted acepta quedar vinculado por los presentes Términos y Condiciones, así como por nuestra Política de Privacidad. Si no está de acuerdo con alguna de estas condiciones, le rogamos que no utilice el Sitio.',
              'El uso del Sitio implica la aceptación plena y sin reservas de todas las disposiciones incluidas en este documento en la versión publicada en el momento de acceso.',
            ],
          },
          {
            num: '2',
            titulo: 'Descripción del servicio',
            contenido: [
              'El Sitio tiene como finalidad la exhibición y comercialización de tapices artísticos creados por Luz Aldape, artista originaria de Cd. M. Múzquiz, Coahuila, con trayectoria de más de 40 años en la técnica de alto lizo y otras técnicas textiles.',
              'Cada obra expuesta es una pieza única e irrepetible. Las fotografías son representativas; los colores reales pueden variar ligeramente según la calibración del monitor del usuario.',
            ],
          },
          {
            num: '3',
            titulo: 'Uso del sitio',
            contenido: [
              'El usuario se compromete a utilizar el Sitio de conformidad con la ley, la moral y el orden público. Queda expresamente prohibido utilizar el Sitio con fines ilícitos o contrarios a los derechos de terceros.',
              'Para realizar una compra es necesario crear una cuenta con datos verídicos. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.',
              'Nos reservamos el derecho de suspender o cancelar cuentas que incurran en conductas fraudulentas, suplantación de identidad o cualquier uso indebido del Sitio.',
            ],
          },
          {
            num: '4',
            titulo: 'Proceso de compra y pagos',
            contenido: [
              'Las obras pueden adquirirse a través del Sitio mediante los métodos de pago disponibles: tarjeta de crédito o débito (procesado por Conekta), PayPal y pago en efectivo en tiendas OXXO. También es posible coordinar el pago directamente con la artista.',
              'El precio de cada obra se expresa en Pesos Mexicanos (MXN) e incluye el IVA correspondiente. Los gastos de envío o traslado, en caso de aplicar, se comunicarán al usuario antes de confirmar la compra.',
              'Una vez realizado el pago, se enviará una confirmación al correo electrónico registrado. Luz Aldape se pondrá en contacto con el comprador en un plazo máximo de 48 horas para coordinar la entrega.',
              'El apartado de una obra se mantiene por un máximo de 72 horas. Transcurrido este plazo sin que se haya completado el pago, la obra quedará disponible nuevamente en el catálogo.',
            ],
          },
          {
            num: '5',
            titulo: 'Política de devoluciones y cancelaciones',
            contenido: [
              'Dado que cada tapiz es una obra de arte única, realizada artesanalmente y de carácter irrepetible, no se aceptan devoluciones ni cambios una vez completada la compra, salvo en los casos expresamente previstos por la legislación mexicana aplicable (Ley Federal de Protección al Consumidor).',
              'Si la obra llega con daños imputables al transporte, el comprador deberá notificarlo dentro de las 48 horas siguientes a la recepción, aportando evidencia fotográfica. En tal caso, se evaluará la situación y se buscará una solución satisfactoria para ambas partes.',
              'Las cancelaciones de pedidos pendientes de pago pueden solicitarse antes de que el pago sea procesado, sin cargo alguno.',
            ],
          },
          {
            num: '6',
            titulo: 'Privacidad y protección de datos',
            contenido: [
              'En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), informamos que los datos personales recabados (nombre, correo electrónico, dirección de envío) serán utilizados exclusivamente para gestionar su cuenta, procesar sus pedidos y mantener comunicación relacionada con los mismos.',
              'Sus datos no serán vendidos, cedidos ni transferidos a terceros, salvo a los proveedores de servicios de pago estrictamente necesarios para procesar las transacciones (Conekta, PayPal).',
              'Usted tiene derecho de Acceso, Rectificación, Cancelación y Oposición (derechos ARCO) sobre sus datos personales. Para ejercerlos, puede escribir a través del formulario de contacto del Sitio.',
              'Los datos de tarjeta de crédito o débito no son almacenados en nuestros servidores. El procesamiento es gestionado íntegramente por Conekta bajo sus propios estándares de seguridad PCI DSS.',
            ],
          },
          {
            num: '7',
            titulo: 'Propiedad intelectual',
            contenido: [
              'Todas las imágenes de obras, fotografías, textos y demás contenidos publicados en el Sitio son propiedad de Luz Aldape o se utilizan con su autorización expresa. Quedan reservados todos los derechos de autor conforme a la Ley Federal del Derecho de Autor.',
              'Queda prohibida la reproducción, distribución, comunicación pública o transformación de cualquier elemento del Sitio sin autorización escrita de la autora.',
              'La adquisición de una obra no implica la cesión de los derechos de autor sobre la misma. El comprador adquiere la propiedad física de la pieza, no los derechos de reproducción o explotación comercial.',
            ],
          },
          {
            num: '8',
            titulo: 'Modificaciones',
            contenido: [
              'Nos reservamos el derecho de modificar los presentes Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor desde su publicación en el Sitio. Se recomienda revisar periódicamente este documento.',
              'El uso continuado del Sitio tras la publicación de cambios implica la aceptación de los nuevos términos.',
            ],
          },
          {
            num: '9',
            titulo: 'Legislación aplicable y jurisdicción',
            contenido: [
              'Los presentes Términos y Condiciones se rigen por la legislación mexicana vigente. Para cualquier controversia derivada del uso del Sitio o de la compra de obras, las partes se someten a la jurisdicción de los tribunales competentes del Puerto de Veracruz, Veracruz, México, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.',
            ],
          },
          {
            num: '10',
            titulo: 'Contacto',
            contenido: [
              'Para cualquier duda, reclamación o ejercicio de derechos relacionados con estos Términos y Condiciones o con la Política de Privacidad, puede ponerse en contacto con nosotros a través del formulario de contacto disponible en el Sitio o directamente con Luz Aldape en el Puerto de Veracruz, Veracruz, México.',
            ],
          },
        ].map((sec) => (
          <div key={sec.num} style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '.75rem', marginBottom: '1rem' }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700,
                color: 'var(--terracota)', opacity: .5, flexShrink: 0,
              }}>{sec.num}.</span>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700,
                color: 'var(--texto)', margin: 0,
              }}>{sec.titulo}</h2>
            </div>
            {sec.contenido.map((parrafo, i) => (
              <p key={i} style={{
                fontSize: '.92rem', color: 'var(--texto-suave)', lineHeight: 1.85,
                marginBottom: '.85rem', paddingLeft: '1.85rem',
                fontWeight: 300,
              }}>{parrafo}</p>
            ))}
          </div>
        ))}

        {/* Pie */}
        <div style={{
          marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--arena-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        }}>
          <p style={{ fontSize: '.78rem', color: '#9a7a60' }}>
            © 2025 Luz Aldape · Talleres Libres de Arte · Universidad Veracruzana
          </p>
          <a href="/" style={{
            fontSize: '.78rem', color: 'var(--terracota)', textDecoration: 'none',
            fontWeight: 600, letterSpacing: '.05em',
          }}>
            ← Volver al inicio
          </a>
        </div>

      </div>
    </div>
  );
}