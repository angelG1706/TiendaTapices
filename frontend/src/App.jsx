import './App.css';
import Navbar from './components/navbar';
import ModalAuth from './components/ModalAuth';
import Carrito from './components/Carrito';
import Inicio from './pages/Inicio';
import PanelAdmin from './pages/admin/PanelAdmin';
import Checkout from './pages/Checkout';
import Terminos from './pages/Terminos';
import useTienda from './store/tienda';

export default function App() {
  const { abrirCarrito, carrito, usuario } = useTienda();
  const totalItems = carrito.length;
  const esAdmin = usuario?.roles?.includes('ROLE_ADMIN');
  const ruta = window.location.pathname;

  if (ruta === '/admin' && esAdmin) return <PanelAdmin />;
  if (ruta === '/admin' && !esAdmin) { window.location.href = '/'; return null; }
  if (ruta === '/checkout') return <Checkout />;
  if (ruta === '/terminos') return <Terminos />;

  return (
    <>
      <Navbar />
      <Inicio />
      <ModalAuth />
      <Carrito />
      {usuario && (
        <button className="cart-fab" onClick={abrirCarrito}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
      )}
    </>
  );
}