import useTienda from '../store/tienda';
import api from '../services/api';

export default function ModalObra({ obra, onCerrar }) {
  const { usuario, abrirLogin, carrito, agregarAlCarrito, abrirCarrito } = useTienda();

  if (!obra) return null;

  const yaApartada = carrito.some((i) => i.tapiz_id === obra.id);

  const apartar = async () => {
    if (!usuario) {
      abrirLogin();
      return;
    }
    if (yaApartada) return;

    try {
      await api.post('/carrito', { tapiz_id: obra.id, cantidad: 1 });
      agregarAlCarrito({ id: Date.now(), tapiz_id: obra.id, titulo: obra.titulo, precio: obra.precio, subtotal: obra.precio });
      onCerrar();
      abrirCarrito();
    } catch (err) {
      console.error('Error al apartar obra:', err);
    }
  };

  const resolverImagen = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `http://127.0.0.1:8000${img}`;
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <div>
            <p className="modal-cat-label">{obra.coleccion || 'Colección'}</p>
            <h5 className="modal-title">{obra.titulo}</h5>
          </div>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-img-wrap">
            {obra.imagen ? (
              <img src={resolverImagen(obra.imagen)} alt={obra.titulo} />
            ) : (
              <svg viewBox="0 0 48 48">
                <rect x="4" y="4" width="40" height="40" rx="1"/>
                <path d="M16 4v40M32 4v40M4 16h40M4 32h40"/>
              </svg>
            )}
          </div>

          <div className="modal-details">
            <div>
              <div className="modal-detail-row">
                <span className="modal-detail-key">Técnica</span>
                <span className="modal-detail-val">{obra.tecnica}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-key">Medidas</span>
                <span className="modal-detail-val">{obra.medidas || '—'}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-key">Precio</span>
                <span className="modal-detail-val" style={{ color: 'var(--terracota)', fontWeight: 700 }}>
                  ${parseFloat(obra.precio).toLocaleString('es-MX')} MXN
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-key">Artista</span>
                <span className="modal-detail-val">Luz Aldape</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-key">Estado</span>
                <span className="modal-disponibilidad" style={{ color: obra.disponible ? '#6b8c6b' : '#c0392b' }}>
                  {obra.disponible ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              {obra.descripcion && (
                <div className="modal-descripcion">
                  <span className="modal-detail-key">Descripción</span>
                  <p className="modal-descripcion-texto">{obra.descripcion}</p>
                </div>
              )}
            </div>

            <div>
              {obra.disponible ? (
                <button
                  className={`btn-apartar ${yaApartada ? 'apartado' : ''}`}
                  onClick={apartar}
                >
                  {yaApartada ? '✓ Ya apartada' : '🛒 Apartar esta obra'}
                </button>
              ) : (
                <button
                  className="btn-apartar"
                  disabled
                  style={{
                    background: '#9a7a60',
                    borderColor: '#9a7a60',
                    cursor: 'not-allowed',
                    opacity: 0.7,
                  }}
                >
                  No disponible
                </button>
              )}
              <a
                href="#contacto"
                className="btn-outline-terracota"
                style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }}
                onClick={onCerrar}
              >
                Consultar por correo
              </a>
            </div>

          </div>
      </div>
    </div>
  </div>
  );
}