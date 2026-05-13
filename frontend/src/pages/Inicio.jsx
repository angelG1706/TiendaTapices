import { useState, useEffect } from 'react';
import ModalObra from '../components/ModalObra';
import api from '../services/api';

// Imágenes originales como fallback si aún no se ha subido ninguna al slot
const IMG_FALLBACK = {
  hero:    '/imagenes/geometricos/punto_y_formas.png',
  artista: '/imagenes/luzAldape.jpeg',
};

export default function Inicio() {
  const [tabActiva, setTabActiva] = useState(null);
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  const [colecciones, setColecciones] = useState([]);
  const [tapices, setTapices] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [imgSitio, setImgSitio] = useState({ hero: null, artista: null });

  useEffect(() => {
    cargarDatos();
    cargarImagenesSitio();
  }, []);

  const cargarImagenesSitio = async () => {
    try {
      const res = await api.get('/admin/imagenes-sitio');
      setImgSitio(res.data);
    } catch {
      // Si falla, se usan los fallbacks definidos arriba
    }
  };

  const resolverImgSitio = (slot) => {
    const ruta = imgSitio[slot];
    if (!ruta) return IMG_FALLBACK[slot];
    // Añadir timestamp para evitar caché cuando cambia la imagen
    return ruta + '?v=' + (ruta.split('/').pop());
  };

  const cargarDatos = async () => {
    try {
      const [resTapices, resColecciones] = await Promise.all([
        api.get('/tapices'),
        api.get('/colecciones'),
      ]);
      setTapices(resTapices.data);
      setColecciones(resColecciones.data);
      if (resColecciones.data.length > 0) {
        setTabActiva(resColecciones.data[0].id);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setCargando(false);
    }
  };

  const obrasDeLaColeccion = tapices.filter(
    (t) => Number(t.coleccion_id) === Number(tabActiva)
  );

  const resolverImagen = (tapiz) => {
    if (!tapiz.imagen) return null;
    if (tapiz.imagen.startsWith('http')) return tapiz.imagen;
    return `http://127.0.0.1:8000${tapiz.imagen}`;
  };

  return (
    <>
      {/* ── HERO ── */}
      <section id="hero">
        <div className="hero-container">
          <div className="hero-text">
            <h1 className="hero-title">
              Arte en<br /><span>Hilos y Telar</span>
            </h1>
            <p className="hero-subtitle">
              Cada tapiz es una historia tejida con las manos. Heredera de siglos
              de tradición artística, Luz Aldape navega en el océano del Arte
              como pez en el agua.
            </p>
            <div className="hero-stats">
              <div>
                <span className="hero-stat-number">+30</span>
                <span className="hero-stat-label">Exp. Colectivas</span>
              </div>
              <div>
                <span className="hero-stat-number">+20</span>
                <span className="hero-stat-label">Exp. Individuales</span>
              </div>
              <div>
                <span className="hero-stat-number">+40</span>
                <span className="hero-stat-label">Años de carrera</span>
              </div>
            </div>
            <div className="hero-buttons">
              <a href="#catalogos" className="btn-terracota">Ver Catálogos</a>
              <a href="#artista" className="btn-outline-terracota">La Artista</a>
            </div>
          </div>

          <div className="hero-img-col">
            <div className="hero-img-frame">
              <img src={resolverImgSitio('hero')} alt="Obra principal de Luz Aldape" />
            </div>
            <span className="hero-badge">Alto<br />Lizo</span>
          </div>
        </div>
      </section>

      {/* ── CATÁLOGOS DINÁMICOS ── */}
      <section id="catalogos">
        <div className="catalogos-container">
          <div className="catalogos-header">
            <span className="section-tag">Obra Completa</span>
            <h2 className="section-title">Catálogos de <em>Tapices</em></h2>
            <span className="section-rule" />
          </div>

          {cargando ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#9a7a60' }}>
              Cargando colecciones...
            </p>
          ) : colecciones.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#9a7a60' }}>
              No hay colecciones disponibles.
            </p>
          ) : (
            <>
              {/* ── CONOCE TU PRÓXIMA COLECCIÓN FAVORITA ── */}
              {(() => {
                const colActiva = colecciones.find(c => c.id === tabActiva);
                return colActiva?.descripcion ? (
                  <div className="coleccion-presentacion">
                    <div className="coleccion-presentacion-inner">
                      <span className="coleccion-presentacion-tag">Sobre esta colección</span>
                      <h3 className="coleccion-presentacion-titulo">
                        Conoce tu próxima <em>colección favorita</em>
                      </h3>
                      <p className="coleccion-presentacion-desc">{colActiva.descripcion}</p>
                    </div>
                  </div>
                ) : null;
              })()}

              <ul className="nav-tabs-galeria">
                {colecciones.map((col) => (
                  <li key={col.id}>
                    <button
                      className={`tab-btn ${tabActiva === col.id ? 'active' : ''}`}
                      onClick={() => setTabActiva(col.id)}
                    >
                      {col.nombre}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="obras-grid">
                {obrasDeLaColeccion.length > 0 ? (
                  obrasDeLaColeccion.map((obra) => {
                    const img = resolverImagen(obra);
                    return (
                      <div
                        key={obra.id}
                        className="obra-card"
                        onClick={() => setObraSeleccionada(obra)}
                      >
                        <div className="obra-img">
                          {img ? (
                            <img src={img} alt={obra.titulo} />
                          ) : (
                            <div className="obra-img-placeholder">
                              <svg viewBox="0 0 40 40">
                                <rect x="4" y="4" width="32" height="32" />
                                <path d="M14 4v32M26 4v32M4 14h32M4 26h32" />
                              </svg>
                            </div>
                          )}
                          <div className="obra-overlay">
                            <span className="obra-overlay-tag">{obra.tecnica}</span>
                            <button className="obra-overlay-btn">Ver detalle</button>
                          </div>
                        </div>
                        <div className="obra-info">
                          <p className="obra-tecnica">{obra.tecnica}</p>
                          <h3 className="obra-titulo">{obra.titulo}</h3>
                          <p className="obra-medidas">{obra.medidas || '—'}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#9a7a60' }}>
                    Esta colección aún no tiene obras.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── MÉTODOS DE PAGO ── */}
      <section id="pago">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Adquiere tu obra</span>
            <h2 className="section-title">Métodos de <em>Pago</em></h2>
            <span className="section-rule" />
            <p style={{ color: 'var(--texto-suave)', maxWidth: 560, margin: '1rem auto 0', fontSize: '.95rem', fontWeight: 300, lineHeight: 1.8 }}>
              Ofrecemos distintas formas de pago para facilitar la adquisición de cada obra única.
            </p>
          </div>
          <div className="pago-grid">
 
            {/* PayPal */}
            <div className="pago-card">
              <div className="pago-icono">
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/PayPal_Logo2014.png" alt="PayPal" style={{ width: 80, height: 48, objectFit: 'contain' }} />
              </div>
              <h3 className="pago-nombre">PayPal</h3>
              <p className="pago-desc">Paga de forma segura con tu cuenta PayPal. Protección al comprador incluida.</p>
              <span className="pago-badge">Disponible</span>
            </div>
 
            {/* Tarjeta */}
            <div className="pago-card">
              <div className="pago-icono">
                <img src="/imagenes/pagos/tarjeta.png" alt="Tarjeta" style={{ width: 80, height: 48, objectFit: 'contain' }} />
              </div>
              <h3 className="pago-nombre">Tarjeta</h3>
              <p className="pago-desc">Crédito o débito. Procesamiento seguro con cifrado SSL a través de Conekta.</p>
              <span className="pago-badge">Disponible</span>
            </div>
 
            {/* OXXO */}
            <div className="pago-card">
              <div className="pago-icono">
                <img src="https://1000marcas.net/wp-content/uploads/2022/02/OXXO-Logo.png" alt="OXXO" style={{ width: 80, height: 48, objectFit: 'contain' }} />
              </div>
              <h3 className="pago-nombre">OXXO</h3>
              <p className="pago-desc">Paga en efectivo en cualquier tienda OXXO con tu referencia de pago.</p>
              <span className="pago-badge">Disponible</span>
            </div>
 
            {/* En Persona */}
            <div className="pago-card">
              <div className="pago-icono">
                <img src="https://cdn-icons-png.flaticon.com/512/2331/2331941.png" alt="En Persona" style={{ width: 80, height: 48, objectFit: 'contain' }} />
              </div>
              <h3 className="pago-nombre">En Persona</h3>
              <p className="pago-desc">Visita el taller en Veracruz o coordina entrega en exposición.</p>
              <span className="pago-badge">Disponible</span>
            </div>
          </div>
          <div className="pago-nota">
            <strong>¿Cómo funciona el proceso?</strong> Una vez que apartes una obra recibirás confirmación.
            En menos de 48 horas Luz Aldape se pondrá en contacto para coordinar el pago y entrega.
            <strong> Las obras son piezas únicas</strong> — el apartado se mantiene por 72 horas.
          </div>
        </div>
      </section>


      {/* ── TÉCNICAS ── */}
      <section id="tecnicas">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Proceso Artístico</span>
            <h2 className="section-title">Técnicas de <em>Tejido</em></h2>
            <span className="section-rule" />
          </div>
          <div className="tec-grid">
            {[
              { icono: '🧵', nombre: 'Alto Lizo', desc: 'Técnica tradicional en telar vertical donde los hilos de trama se entrelazan a mano con la urdimbre. Permite detalle pictórico y grandes formatos.' },
              { icono: '🌊', nombre: 'Fuera de Telar', desc: 'Técnica experimental donde el tejido se construye libremente, sin la estructura rígida del telar. Permite crear formas orgánicas, escultóricas y tridimensionales.' },
              { icono: '🎨', nombre: 'Materiales', desc: 'Lana natural, hilos de acrílico de alta resistencia y urdimbres de algodón. Garantizando durabilidad y viveza de color en cada pieza.' },
            ].map((t) => (
              <div className="tec-card" key={t.nombre}>
                <div className="tec-icon">{t.icono}</div>
                <h3 className="tec-nombre">{t.nombre}</h3>
                <p className="tec-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERSONALIZABLES ── */}
      <section id="personalizables">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Obra a la Medida</span>
            <h2 className="section-title">Tapices <em>Personalizables</em></h2>
            <span className="section-rule" />
            <p style={{ color: 'var(--texto-suave)', maxWidth: 580, margin: '1rem auto 0', fontSize: '.95rem', fontWeight: 300, lineHeight: 1.8 }}>
              Cada encargo es un diálogo entre la artista y el cliente. Luz Aldape crea tapices únicos adaptados a tu espacio, paleta y temática.
            </p>
          </div>
          <div className="config-grid">
            {[
              { icono: '🎨', titulo: 'Diseño Exclusivo', desc: 'Motivos prehispánicos, marinos, geométricos o figurativos. Desde inspiraciones propias hasta ideas del cliente.' },
              { icono: '📐', titulo: 'Medidas a la Carta', desc: 'Desde pequeños formatos de colección hasta grandes instalaciones murales, todo según tu espacio.' },
              { icono: '🧵', titulo: 'Materiales Elegidos', desc: 'Lana natural, acrílico de alta resistencia o combinaciones especiales. Durabilidad y viveza garantizadas.' },
            ].map((c) => (
              <div className="config-card" key={c.titulo}>
                <div className="config-icon">{c.icono}</div>
                <h3 className="config-titulo">{c.titulo}</h3>
                <p className="config-desc">{c.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a href="#contacto" className="btn-terracota">Solicitar tapiz personalizado</a>
          </div>
        </div>
      </section>

      {/* ── LA ARTISTA ── */}
      <section id="artista">
        <div className="section-container">
          <div className="artista-layout">
            <div>
              <div className="artista-foto">
                <img src={resolverImgSitio('artista')} alt="Luz Aldape" />
              </div>
              <div className="logros-grid">
                {[
                  { num: '+30', desc: 'Exp. Colectivas' },
                  { num: '+20', desc: 'Exp. Individuales' },
                  { num: '1981', desc: 'Fundadora TLA·UV' },
                  { num: '12+', desc: 'Países expuestos' },
                ].map((l) => (
                  <div className="logro-box" key={l.desc}>
                    <span className="logro-num">{l.num}</span>
                    <span className="logro-desc">{l.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="artista-nombre">Luz <span>Aldape</span></h2>
              <p className="artista-rol">Tapicera artística · Talleres Libres de Arte · Universidad Veracruzana</p>
              <p className="artista-texto">
                Originaria de Cd. M. Múzquiz, Coahuila, Luz Aldape estudió en la Escuela de Artes Plásticas
                de la Universidad Veracruzana, becada tres años en el Taller Nacional de Tapiz del Instituto Nacional
                de Bellas Artes en la Ciudad de México, bajo la dirección del maestro Pedro Preux y la maestra Bertha Preciado.
              </p>
              <p className="artista-texto">
                En 1981 cofundó los Talleres Libres de Arte de la U.V. en el Puerto de Veracruz.
                Sus obras han sido presentadas en Cuba, Suiza, EE.UU., Argentina, Corea del Sur, Colombia, Uruguay, Italia e Irlanda.
              </p>
              <div className="cita-bloque">
                <p className="cita-texto">
                  Luz Aldape, veracruzana por decisión, es una de las pocas artistas contemporáneas que conserva
                  el arte del Tapiz y lo transmite a las nuevas generaciones, como debe hacer todo buen Maestro.
                </p>
                <p className="cita-autor">— Marcela Prado · Tuxpan de Rodríguez Clara, 25 de septiembre de 2013</p>
              </div>
              <div className="timeline">
                {[
                  { year: '1981', text: 'Cofundadora de los Talleres Libres de Arte de la U.V.' },
                  { year: '2001', text: 'Gran tapiz como escenografía para la obra "Esperas" del maestro Alejandro Swchartz.' },
                  { year: '2007–2008', text: 'Serie "Como Pez en el Agua" en el Centro Veracruzano de las Artes.' },
                  { year: '2025', text: 'Bienal Internacional de Tapiz Miami · Teatro Solís Montevideo · Roma-México.' },
                  { year: '2025–2026', text: 'Serie Tapices Geométricos. Jurado en el Premio Anual Artesanal Veracruzano.' },
                ].map((tl) => (
                  <div className="tl-item" key={tl.year}>
                    <p className="tl-year">{tl.year}</p>
                    <p className="tl-text">{tl.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto">
        <div className="section-container">
          <div className="contacto-layout">
            <div>
              <span className="section-tag contacto-tag">Ponte en contacto</span>
              <h2 className="section-title contacto-titulo" style={{ marginTop: '.5rem' }}>
                Hablemos de<br /><em>tu tapiz</em>
              </h2>
              <p style={{ color: '#c8b09a', fontSize: '.95rem', fontWeight: 300, lineHeight: 1.8, margin: '1.5rem 0' }}>
                ¿Te interesa adquirir una obra, encargar un tapiz personalizado o invitar a Luz Aldape a exponer?
              </p>
              <p className="contacto-dato"><strong>Ubicación:</strong> Puerto de Veracruz, Veracruz, México</p>
              <p className="contacto-dato"><strong>Institución:</strong> Talleres Libres de Arte · Universidad Veracruzana</p>
              <p className="contacto-dato"><strong>Trayectoria:</strong> Más de 40 años de práctica artística</p>
            </div>

            <FormContacto />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <p className="footer-brand">
            Luz Aldape
            <span>Tapices Artísticos · Veracruz, México</span>
          </p>

          <div style={{ textAlign: 'center' }}>
            <p className="footer-copy">© 2025 Luz Aldape · Todos los derechos reservados</p>
            <a
              href="/terminos"
              style={{ display: 'inline-block', fontSize: '.72rem', color: '#5a3e2b', marginTop: '.4rem', textDecoration: 'underline', opacity: .8 }}
            >
              Términos y Condiciones
            </a>
          </div>

          <div style={{ textAlign: 'right' }}>
            <strong style={{ display: 'block', fontSize: '.82rem', color: '#9a7a60' }}>Talleres Libres de Arte</strong>
            <a
              href="https://www.facebook.com/laldape?locale=es_LA"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                color: '#7a5c44', textDecoration: 'none', fontSize: '.82rem',
                marginTop: '.4rem', opacity: .85, transition: 'opacity .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = .85}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </footer>

      {/* ── MODAL OBRA ── */}
      <ModalObra obra={obraSeleccionada} onCerrar={() => setObraSeleccionada(null)} />
    </>
  );
}
// ── FORMULARIO DE CONTACTO ────────────────────────────────────
function FormContacto() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    tipo: 'Adquirir una obra del catálogo',
    mensaje: '',
  });
  const [estado, setEstado] = useState('idle'); // idle | enviando | ok | error
  const [errorMsg, setErrorMsg] = useState('');

  const cambiar = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      setErrorMsg('Por favor completa nombre, correo y mensaje.');
      setEstado('error');
      return;
    }
    setEstado('enviando');
    setErrorMsg('');
    try {
      await api.post('/contacto', form);
      setEstado('ok');
      setForm({ nombre: '', email: '', tipo: 'Adquirir una obra del catálogo', mensaje: '' });
    } catch (err) {
      setEstado('error');
      setErrorMsg(err.response?.data?.error || 'No se pudo enviar el mensaje. Intenta de nuevo.');
    }
  };

  if (estado === 'ok') {
    return (
      <div className="form-wrap form-wrap-ok">
        <div className="form-ok-icon">✓</div>
        <h3 className="form-wrap-title">¡Mensaje enviado!</h3>
        <p style={{ color: '#c8b09a', fontSize: '.9rem', lineHeight: 1.8, marginTop: '.5rem' }}>
          Gracias por escribir. Luz Aldape se pondrá en contacto contigo en menos de 48 horas.
        </p>
        <button
          className="btn-outline-terracota"
          style={{ marginTop: '1.5rem' }}
          onClick={() => setEstado('idle')}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <div className="form-wrap">
      <h3 className="form-wrap-title">Enviar mensaje</h3>
      <div className="form-grid">
        <div>
          <label className="form-label">Nombre</label>
          <input
            className="form-input"
            type="text"
            placeholder="Tu nombre completo"
            value={form.nombre}
            onChange={cambiar('nombre')}
            disabled={estado === 'enviando'}
          />
        </div>
        <div>
          <label className="form-label">Correo electrónico</label>
          <input
            className="form-input"
            type="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={cambiar('email')}
            disabled={estado === 'enviando'}
          />
        </div>
        <div className="form-col-full">
          <label className="form-label">Tipo de consulta</label>
          <select
            className="form-select"
            value={form.tipo}
            onChange={cambiar('tipo')}
            disabled={estado === 'enviando'}
          >
            <option>Adquirir una obra del catálogo</option>
            <option>Encargar tapiz personalizado</option>
            <option>Invitación a exponer</option>
            <option>Prensa / medios</option>
            <option>Otro</option>
          </select>
        </div>
        <div className="form-col-full">
          <label className="form-label">Mensaje</label>
          <textarea
            className="form-textarea"
            placeholder="Cuéntanos sobre tu proyecto o consulta..."
            value={form.mensaje}
            onChange={cambiar('mensaje')}
            disabled={estado === 'enviando'}
          />
        </div>

        {estado === 'error' && (
          <div className="form-col-full">
            <p style={{ color: '#c0392b', fontSize: '.82rem', margin: 0 }}>⚠ {errorMsg}</p>
          </div>
        )}

        <div className="form-col-full">
          <button
            className="btn-terracota"
            style={{ width: '100%', justifyContent: 'center', opacity: estado === 'enviando' ? 0.7 : 1 }}
            onClick={enviar}
            disabled={estado === 'enviando'}
          >
            {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </div>
      </div>
    </div>
  );
}