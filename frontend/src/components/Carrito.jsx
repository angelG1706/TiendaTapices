import { useEffect } from 'react';
import useTienda from '../store/tienda';
import api from '../services/api';

const resolverImagen = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `http://127.0.0.1:8000${img}`;
};

export default function Carrito() {
  const { carritoAbierto, cerrarCarrito, carrito, setCarrito, quitarDelCarrito, usuario } = useTienda();

  useEffect(() => {
    if (usuario && carritoAbierto) {
      cargarCarrito();
    }
  }, [carritoAbierto, usuario]);

  const cargarCarrito = async () => {
    try {
      const res = await api.get('/carrito');
      setCarrito(res.data.items || []);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
    }
  };

  const eliminarItem = async (id) => {
    try {
      await api.delete(`/carrito/${id}`);
      quitarDelCarrito(id);
    } catch (err) {
      console.error('Error al eliminar item:', err);
    }
  };

  const total = carrito.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);

  if (!carritoAbierto) return null;

  return (
    <>
      <div className="offcanvas-overlay" onClick={cerrarCarrito} />
      <div className="offcanvas">

        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Obras apartadas</h5>
          <button className="offcanvas-close" onClick={cerrarCarrito}>✕</button>
        </div>

        <div className="offcanvas-body">
          {carrito.length === 0 ? (
            <div className="cart-empty">
              <svg viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p>Aún no has apartado ninguna obra.<br/>Explora el catálogo.</p>
            </div>
          ) : (
            carrito.map((item) => {
              const img = resolverImagen(item.imagen);
              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-img">
                    {img ? (
                      <img src={img} alt={item.titulo} />
                    ) : (
                      <svg viewBox="0 0 40 40">
                        <rect x="4" y="4" width="32" height="32"/>
                        <path d="M14 4v32M26 4v32M4 14h32M4 26h32"/>
                      </svg>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-cat">Tapiz</p>
                    <p className="cart-item-titulo">{item.titulo}</p>
                    <p className="cart-item-precio">
                      ${parseFloat(item.precio).toLocaleString('es-MX')} MXN
                    </p>
                  </div>
                  <button className="cart-item-remove" onClick={() => eliminarItem(item.id)}>✕</button>
                </div>
              );
            })
          )}
        </div>

        {carrito.length > 0 && (
          <div className="offcanvas-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-val">${total.toLocaleString('es-MX')} MXN</span>
            </div>
            <button
              className="btn-terracota"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                cerrarCarrito();
                window.location.href = '/checkout';
              }}
            >
              Proceder al pago
            </button>
          </div>
        )}

      </div>
    </>
  );
}