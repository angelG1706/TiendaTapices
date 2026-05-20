import { useState, useEffect } from 'react';
import useTienda from '../store/tienda';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, logout, abrirLogin, abrirRegistro, abrirCarrito, carrito } = useTienda();

  useEffect(() => {
    const manejarScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', manejarScroll);
    return () => window.removeEventListener('scroll', manejarScroll);
  }, []);

  const totalItems = carrito.length;

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">

        <a href="#hero" className="navbar-brand">
          <span className="brand-name">Luz Aldape</span>
          <span className="brand-sub">Tapices Artísticos · Veracruz</span>
        </a>

        {/* Links desktop */}
        <ul className="nav-links">
          <li><a href="#catalogos">Catálogos</a></li>
          <li><a href="#personalizables">Personalizables</a></li>
          <li><a href="#tecnicas">Técnicas</a></li>
          <li><a href="#artista">La Artista</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>

        {/* Botones desktop */}
        <div className="nav-auth-buttons">
          {usuario ? (
            <>
              <span className="nav-user-name">Hola, {usuario.nombre.split(' ')[0]}</span>
              {usuario.roles?.includes('ROLE_ADMIN') && (
                <a href="/admin" className="btn-nav-login" style={{ borderColor: '#9a7a60', color: '#9a7a60' }}>
                  Panel Admin
                </a>
              )}
              <button className="cart-nav-btn" onClick={abrirCarrito}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </button>
              <button className="btn-nav-logout" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <button className="btn-nav-login" onClick={abrirLogin}>Iniciar sesión</button>
              <button className="btn-nav-register" onClick={abrirRegistro}>Registrarse</button>
            </>
          )}
        </div>

        {/* Móvil: carrito + hamburguesa */}
        <div className="nav-mobile-actions">
          <button className="cart-nav-btn" onClick={abrirCarrito}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
          <button className="hamburger-btn" onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? '✕' : '☰'}
          </button>
        </div>

      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="mobile-menu">
          <ul className="mobile-nav-links">
            <li><a href="#catalogos" onClick={cerrarMenu}>Catálogos</a></li>
            <li><a href="#personalizables" onClick={cerrarMenu}>Personalizables</a></li>
            <li><a href="#tecnicas" onClick={cerrarMenu}>Técnicas</a></li>
            <li><a href="#artista" onClick={cerrarMenu}>La Artista</a></li>
            <li><a href="#contacto" onClick={cerrarMenu}>Contacto</a></li>
          </ul>
          <div className="mobile-auth">
            {usuario ? (
              <>
                <span className="mobile-user-name">Hola, {usuario.nombre.split(' ')[0]}</span>
                {usuario.roles?.includes('ROLE_ADMIN') && (
                  <a href="/admin" className="btn-nav-login mobile-btn" onClick={cerrarMenu}>
                    Panel Admin
                  </a>
                )}
                <button className="btn-nav-logout mobile-btn" onClick={() => { logout(); cerrarMenu(); }}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button className="btn-nav-login mobile-btn" onClick={() => { abrirLogin(); cerrarMenu(); }}>
                  Iniciar sesión
                </button>
                <button className="btn-nav-register mobile-btn" onClick={() => { abrirRegistro(); cerrarMenu(); }}>
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}