import { useState } from 'react';
import useTienda from '../store/tienda';
import api from '../services/api';

export default function ModalAuth() {
  const { authModal, cerrarAuth, abrirLogin, abrirRegistro, login } = useTienda();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [formLogin, setFormLogin] = useState({ email: '', password: '' });
  const [formRegistro, setFormRegistro] = useState({ nombre: '', email: '', password: '' });
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  if (!authModal) return null;

  const limpiarYCerrar = () => {
    setFormLogin({ email: '', password: '' });
    setFormRegistro({ nombre: '', email: '', password: '' });
    setAceptaTerminos(false);
    setError('');
    cerrarAuth();
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await api.post('/login', formLogin);
      const token = res.data.token;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const usuario = {
        nombre: payload.username.split('@')[0].split('.')[0],
        email: payload.username,
        roles: payload.roles,
      };
      login(usuario, token);
      setFormLogin({ email: '', password: '' });
      cerrarAuth();
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    if (!aceptaTerminos) {
      setError('Debes aceptar los Términos y Condiciones para continuar.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      await api.post('/registro', formRegistro);
      const res = await api.post('/login', {
        email: formRegistro.email,
        password: formRegistro.password,
      });
      const token = res.data.token;
      const usuario = {
        nombre: formRegistro.nombre,
        email: formRegistro.email,
        roles: ['ROLE_USER'],
      };
      login(usuario, token);
      setFormRegistro({ nombre: '', email: '', password: '' });
      cerrarAuth();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={limpiarYCerrar}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>

        {authModal === 'login' ? (
          <>
            <h2 className="auth-modal-title">Bienvenida</h2>
            <p className="auth-modal-subtitle">Inicia sesión para apartar obras y realizar pedidos.</p>

            <form className="auth-form" onSubmit={manejarLogin}>
              <div>
                <label className="auth-label">Correo electrónico</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formLogin.email}
                  onChange={(e) => setFormLogin({ ...formLogin, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="auth-label">Contraseña</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={formLogin.password}
                  onChange={(e) => setFormLogin({ ...formLogin, password: e.target.value })}
                  required
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="btn-terracota" type="submit" disabled={cargando} style={{ justifyContent: 'center' }}>
                {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="auth-switch">
              ¿No tienes cuenta?{' '}
              <button onClick={() => { setError(''); setFormLogin({ email: '', password: '' }); abrirRegistro(); }}>
                Regístrate aquí
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="auth-modal-title">Crear cuenta</h2>
            <p className="auth-modal-subtitle">Regístrate para guardar tus obras favoritas y realizar pedidos.</p>

            <form className="auth-form" onSubmit={manejarRegistro}>
              <div>
                <label className="auth-label">Nombre completo</label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Tu nombre"
                  value={formRegistro.nombre}
                  onChange={(e) => setFormRegistro({ ...formRegistro, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="auth-label">Correo electrónico</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formRegistro.email}
                  onChange={(e) => setFormRegistro({ ...formRegistro, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="auth-label">Contraseña</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formRegistro.password}
                  onChange={(e) => setFormRegistro({ ...formRegistro, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              {/* Términos y condiciones */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.65rem', marginTop: '.25rem' }}>
                <input
                  type="checkbox"
                  id="acepta-terminos"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  style={{ marginTop: '.2rem', accentColor: 'var(--terracota)', width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }}
                />
                <label htmlFor="acepta-terminos" style={{ fontSize: '.78rem', color: '#9a7a60', lineHeight: 1.6, cursor: 'pointer' }}>
                  He leído y acepto los{' '}
                  <a
                    href="/terminos"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--terracota)', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Términos y Condiciones
                  </a>
                  {' '}y la Política de Privacidad de Luz Aldape Tapices Artísticos.
                </label>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="btn-terracota" type="submit" disabled={cargando || !aceptaTerminos} style={{ justifyContent: 'center', opacity: !aceptaTerminos ? 0.6 : 1 }}>
                {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="auth-switch">
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => { setError(''); setFormRegistro({ nombre: '', email: '', password: '' }); abrirLogin(); }}>
                Inicia sesión
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}