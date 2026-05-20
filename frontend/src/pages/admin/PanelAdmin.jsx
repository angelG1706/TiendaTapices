import { useState, useEffect, useCallback } from 'react';
import './PanelAdmin.css';
import useTienda from '../../store/tienda';
import api from '../../services/api';

// ── VISTAS ──────────────────────────────────────────────────
const VISTAS = {
  dashboard:   { titulo: 'Dashboard',          subtitulo: 'Resumen general del sistema' },
  obras:       { titulo: 'Gestión de Obras',   subtitulo: 'Administra el catálogo completo de tapices' },
  colecciones: { titulo: 'Colecciones',        subtitulo: 'Organiza los tapices por colección' },
  imagenes:    { titulo: 'Imágenes del Sitio', subtitulo: 'Gestiona las imágenes principales de la página de inicio' },
  pedidos:     { titulo: 'Pedidos',            subtitulo: 'Historial y estado de todos los pedidos' },
  usuarios:    { titulo: 'Usuarios',           subtitulo: 'Lista de clientes y administradores' },
};

export default function PanelAdmin() {
  const { usuario, logout } = useTienda();
  const [colapsado, setColapsado] = useState(false);
  const [vista, setVista] = useState('dashboard');
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [toast, setToast] = useState({ visible: false, mensaje: '' });

  const mostrarToast = useCallback((mensaje) => {
    setToast({ visible: true, mensaje });
    setTimeout(() => setToast({ visible: false, mensaje: '' }), 3000);
  }, []);

  const inicial = usuario?.nombre?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div className={`panel-root ${colapsado ? 'colapsado' : ''} ${movilAbierto ? 'movil-abierto' : ''}`}>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-cabecera">
          {!colapsado && (
            <>
              <div className="sidebar-logo">LA</div>
              <div>
                <span className="sidebar-marca-nombre sidebar-texto">Luz Aldape</span>
                <span className="sidebar-marca-sub sidebar-texto">Panel Admin</span>
              </div>
            </>
          )}
          <button className="sidebar-btn-colapsar" onClick={() => setColapsado(!colapsado)}>
            <svg viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-seccion-titulo">Principal</p>
          <NavLink vista="dashboard" actual={vista} onNavegar={setVista} icono={
            <svg className="sidebar-icono" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          }>Dashboard</NavLink>

          <hr className="sidebar-divisor" />
          <p className="sidebar-seccion-titulo">Catálogo</p>
          <NavLink vista="obras" actual={vista} onNavegar={setVista} icono={
            <svg className="sidebar-icono" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          }>Gestión de Obras</NavLink>
          <NavLink vista="colecciones" actual={vista} onNavegar={setVista} icono={
            <svg className="sidebar-icono" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
          }>Colecciones</NavLink>
          <NavLink vista="imagenes" actual={vista} onNavegar={setVista} icono={
            <svg className="sidebar-icono" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          }>Imágenes del Sitio</NavLink>

          <hr className="sidebar-divisor" />
          <p className="sidebar-seccion-titulo">Ventas</p>
          <NavLink vista="pedidos" actual={vista} onNavegar={setVista} icono={
            <svg className="sidebar-icono" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          }>Pedidos</NavLink>


          <hr className="sidebar-divisor" />
          <p className="sidebar-seccion-titulo">Sistema</p>
          <NavLink vista="usuarios" actual={vista} onNavegar={setVista} icono={
            <svg className="sidebar-icono" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          }>Usuarios</NavLink>
          <a className="sidebar-link" href="/">
            <svg className="sidebar-icono" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="sidebar-texto">Volver al sitio</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">{inicial}</div>
          <div className="sidebar-footer-info sidebar-texto">
            <p className="sidebar-footer-nombre">{usuario?.nombre || 'Admin'}</p>
            <p className="sidebar-footer-rol">ROLE_ADMIN</p>
          </div>
          <button className="sidebar-btn-logout" onClick={logout} title="Cerrar sesión">
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      {movilAbierto && (
        <div className="sidebar-overlay" onClick={() => setMovilAbierto(false)} />
      )}

      {/* ── ÁREA PRINCIPAL ── */}
      <div className="panel-main">
      <header className="topbar">
        <button className="topbar-hamburger" onClick={() => setMovilAbierto(!movilAbierto)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div>
          <p className="topbar-titulo">{VISTAS[vista].titulo}</p>
          <p className="topbar-subtitulo">{VISTAS[vista].subtitulo}</p>
        </div>
        <div className="topbar-espaciador" />
        <button className="topbar-btn-notif">
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className="topbar-notif-punto" />
        </button>
        <div className="topbar-perfil">
          <div className="topbar-avatar">{inicial}</div>
          <span className="topbar-nombre">{usuario?.nombre || 'Admin'}</span>
        </div>
      </header>

        <main className="panel-contenido">
          {vista === 'dashboard'   && <VistaDashboard />}
          {vista === 'obras'       && <VistaObras mostrarToast={mostrarToast} />}
          {vista === 'colecciones' && <VistaColecciones mostrarToast={mostrarToast} />}
          {vista === 'imagenes'    && <VistaImagenes mostrarToast={mostrarToast} />}
          {vista === 'pedidos'     && <VistaPedidos mostrarToast={mostrarToast} />}
          {vista === 'usuarios'    && <VistaUsuarios mostrarToast={mostrarToast} />}
        </main>
      </div>

      {/* ── TOAST ── */}
      <div className={`toast-panel ${toast.visible ? 'visible' : ''}`}>
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{toast.mensaje}</span>
      </div>

    </div>
  );
}

// ── COMPONENTE NAVLINK ───────────────────────────────────────
function NavLink({ vista, actual, onNavegar, icono, children }) {
  return (
    <button className={`sidebar-link ${actual === vista ? 'activo' : ''}`} onClick={() => onNavegar(vista)}>
      {icono}
      <span className="sidebar-texto">{children}</span>
    </button>
  );
}

// ── VISTA DASHBOARD ─────────────────────────────────────────
function VistaDashboard() {
  const [stats, setStats] = useState({ obras: '—', pedidos: '—', usuarios: '—', colecciones: '—' });

  useEffect(() => {
    const cargar = async () => {
      try {
        const [obras, pedidos, usuarios, colecciones] = await Promise.all([
          api.get('/tapices'),
          api.get('/pedidos'),
          api.get('/admin/usuarios'),
          api.get('/colecciones'),
        ]);
        setStats({
          obras: obras.data.length,
          pedidos: pedidos.data.length,
          usuarios: usuarios.data.length,
          colecciones: colecciones.data.length,
        });
      } catch {}
    };
    cargar();
  }, []);

  return (
    <div className="panel-vista-anim">
      <div className="vista-cabecera">
        <div>
          <h2 className="vista-titulo">Dashboard</h2>
          <p className="vista-descripcion">Resumen general de obras, pedidos y usuarios</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard valor={stats.obras} etiqueta="Obras en catálogo" color="#a0522d" fondo="rgba(160,82,45,.1)">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        </StatCard>
        <StatCard valor={stats.pedidos} etiqueta="Pedidos totales" color="#b45309" fondo="rgba(180,83,9,.1)">
          <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </StatCard>
        <StatCard valor={stats.usuarios} etiqueta="Usuarios registrados" color="#1565c0" fondo="rgba(21,101,192,.1)">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </StatCard>
        <StatCard valor={stats.colecciones} etiqueta="Colecciones" color="#2e7d32" fondo="rgba(46,125,50,.1)">
          <svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
        </StatCard>
      </div>

      <div className="panel-card">
        <div className="panel-card-cabecera">
          <div>
            <p className="panel-card-titulo">Actividad mensual</p>
            <p className="panel-card-subtitulo">Pedidos por mes</p>
          </div>
        </div>
        <div className="panel-card-cuerpo">
          <div className="barchart">
            {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((mes) => (
              <div className="barchart-col" key={mes}>
                <div className="barchart-barra" style={{ height: '0%' }} />
                <span className="barchart-label">{mes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ valor, etiqueta, color, fondo, children }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color, '--stat-fondo': fondo }}>
      <div className="stat-icono-wrap">{children}</div>
      <div>
        <div className="stat-valor">{valor}</div>
        <div className="stat-etiqueta">{etiqueta}</div>
      </div>
    </div>
  );
}

// ── VISTA OBRAS ─────────────────────────────────────────────
function VistaObras({ mostrarToast }) {
  const [obras, setObras] = useState([]);
  const [colecciones, setColecciones] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [obraEditando, setObraEditando] = useState(null);
  const [tipoImagen, setTipoImagen] = useState('url');
  const [imagenPreview, setImagenPreview] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [form, setForm] = useState({
    titulo: '', precio: '', stock: '', tecnica: '',
    medidas: '', coleccion_id: '', disponible: true, imagen_url: '', descripcion: ''
  });
  const [generandoDesc, setGenerandoDesc] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const [o, c] = await Promise.all([api.get('/tapices'), api.get('/colecciones')]);
      setObras(o.data);
      setColecciones(c.data);
    } catch {}
  };

  const abrirCrear = () => {
    setObraEditando(null);
    setForm({ titulo: '', precio: '', stock: '', tecnica: '', medidas: '', coleccion_id: '', disponible: true, imagen_url: '', descripcion: '' });
    setImagenPreview(null);
    setArchivoImagen(null);
    setTipoImagen('url');
    setModalAbierto(true);
  };

  const abrirEditar = (obra) => {
    setObraEditando(obra);
    setForm({
      titulo: obra.titulo,
      precio: obra.precio,
      stock: obra.stock,
      tecnica: obra.tecnica,
      medidas: obra.medidas || '',
      coleccion_id: obra.coleccion_id || '',
      disponible: obra.disponible,
      imagen_url: obra.imagen?.startsWith('http') ? obra.imagen : '',
      descripcion: obra.descripcion || '',
    });
    setImagenPreview(
      obra.imagen
        ? obra.imagen.startsWith('http')
          ? obra.imagen
          : `http://127.0.0.1:8000${obra.imagen}`
        : null
    );
    setArchivoImagen(null);
    setTipoImagen(obra.imagen?.startsWith('http') ? 'url' : 'archivo');
    setModalAbierto(true);
  };

  const manejarArchivoSeleccionado = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setArchivoImagen(archivo);
    setImagenPreview(URL.createObjectURL(archivo));
  };

  const manejarUrlImagen = (url) => {
    setForm(f => ({ ...f, imagen_url: url }));
    setImagenPreview(url || null);
  };

  const guardar = async () => {
    if (!form.titulo.trim()) {
      mostrarToast('El título es obligatorio');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('precio', form.precio);
      formData.append('stock', form.stock);
      formData.append('tecnica', form.tecnica);
      formData.append('medidas', form.medidas);
      formData.append('coleccion_id', form.coleccion_id);
      formData.append('disponible', form.disponible ? '1' : '0');
      formData.append('descripcion', form.descripcion || '');

      if (tipoImagen === 'url' && form.imagen_url) {
        formData.append('imagen_url', form.imagen_url);
      } else if (tipoImagen === 'archivo' && archivoImagen) {
        formData.append('imagen', archivoImagen);
      }

      if (obraEditando) {
        await api.post(`/tapices/${obraEditando.id}/editar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarToast('Obra actualizada correctamente');
      } else {
        await api.post('/tapices', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarToast('Obra creada correctamente');
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      mostrarToast('Error al guardar: ' + (err.response?.data?.error || err.message));
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta obra?')) return;
    try {
      await api.delete(`/tapices/${id}`);
      mostrarToast('Obra eliminada');
      cargar();
    } catch {}
  };

  const resolverImagen = (obra) => {
    if (!obra.imagen) return null;
    if (obra.imagen.startsWith('http')) return obra.imagen;
    return `http://127.0.0.1:8000${obra.imagen}`;
  };

  return (
    <div className="panel-vista-anim">
      <div className="vista-cabecera">
        <div>
          <h2 className="vista-titulo">Gestión de Obras</h2>
          <p className="vista-descripcion">Administra el catálogo completo de tapices</p>
        </div>
        <button className="btn-panel btn-panel-primario" onClick={abrirCrear}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva obra
        </button>
      </div>

      <div className="tabla-wrap">
        <table className="tabla">
          <thead>
            <tr>
              <th>Obra</th><th>Técnica</th><th>Medidas</th>
              <th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {obras.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--panel-muted)' }}>
                  No hay obras registradas. Usa <strong>Nueva obra</strong> para agregar la primera.
                </td>
              </tr>
            ) : obras.map((obra) => {
              const img = resolverImagen(obra);
              return (
                <tr key={obra.id}>
                  <td>
                    <div className="tabla-obra-info">
                      <div className="tabla-thumb">
                        {img
                          ? <img src={img} alt={obra.titulo} />
                          : <svg viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32"/><path d="M14 4v32M26 4v32M4 14h32M4 26h32"/></svg>
                        }
                      </div>
                      <div>
                        <p className="tabla-obra-nombre">{obra.titulo}</p>
                        <p className="tabla-obra-id">#{obra.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>{obra.tecnica}</td>
                  <td>{obra.medidas || '—'}</td>
                  <td>${parseFloat(obra.precio).toLocaleString('es-MX')}</td>
                  <td>{obra.stock}</td>
                  <td>
                    <span className={`badge ${obra.disponible ? 'badge-disponible' : 'badge-vendida'}`}>
                      {obra.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td>
                    <div className="tabla-acciones">
                      <button className="tabla-btn-accion" onClick={() => abrirEditar(obra)} title="Editar">
                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="tabla-btn-accion peligro" onClick={() => eliminar(obra.id)} title="Eliminar">
                        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="tabla-pie">
          <span className="paginacion-info">Mostrando {obras.length} obras</span>
        </div>
      </div>

      {/* ── MODAL ── */}
      {modalAbierto && (
        <div className="panel-modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-tarjeta" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h3 className="modal-titulo">{obraEditando ? 'Editar obra' : 'Nueva obra'}</h3>
              <button className="modal-btn-cerrar" onClick={() => setModalAbierto(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="modal-cuerpo">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Título — campo completo */}
                <div>
                  <label className="campo-label">Título de la obra *</label>
                  <input
                    className="campo-input"
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                    placeholder="Ej. Greca Decorativa"
                    autoFocus
                  />
                </div>

                {/* Precio y Stock en fila */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="campo-label">Precio (MXN) *</label>
                    <input
                      className="campo-input"
                      type="number"
                      value={form.precio}
                      onChange={(e) => setForm(f => ({ ...f, precio: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="campo-label">Stock *</label>
                    <input
                      className="campo-input"
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Técnica y Medidas en fila */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="campo-label">Técnica *</label>
                    <select
                      className="campo-select"
                      value={form.tecnica}
                      onChange={(e) => setForm(f => ({ ...f, tecnica: e.target.value }))}
                    >
                      <option value="">Seleccionar…</option>
                      <option>Alto lizo</option>
                      <option>Fuera de telar</option>
                      <option>Acrílico sobre algodón</option>
                    </select>
                  </div>
                  <div>
                    <label className="campo-label">Medidas</label>
                    <input
                      className="campo-input"
                      value={form.medidas}
                      onChange={(e) => setForm(f => ({ ...f, medidas: e.target.value }))}
                      placeholder="Ej. 1.50 × 0.80 m"
                    />
                  </div>
                </div>

                {/* Colección — campo completo */}
                <div>
                  <label className="campo-label">Colección</label>
                  <select
                    className="campo-select"
                    value={form.coleccion_id}
                    onChange={(e) => setForm(f => ({ ...f, coleccion_id: e.target.value }))}
                  >
                    <option value="">Sin colección</option>
                    {colecciones.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Descripción con botón IA */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                    <label className="campo-label" style={{ margin: 0 }}>Descripción de la obra</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!form.titulo) {
                          mostrarToast('Escribe el título de la obra primero');
                          return;
                        }
                        setGenerandoDesc(true);
                        try {
                          const colNombre = colecciones.find(c => String(c.id) === String(form.coleccion_id))?.nombre || '';
                          const res = await api.post('/admin/generar-descripcion', {
                            titulo:    form.titulo,
                            tecnica:   form.tecnica,
                            medidas:   form.medidas,
                            coleccion: colNombre,
                          });
                          setForm(f => ({ ...f, descripcion: res.data.descripcion }));
                          mostrarToast('✓ Descripción generada con IA');
                        } catch (err) {
                          mostrarToast('Error al generar: ' + (err.response?.data?.error || err.message));
                        } finally {
                          setGenerandoDesc(false);
                        }
                      }}
                      disabled={generandoDesc}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '.35rem',
                        fontSize: '.68rem', fontWeight: 600, letterSpacing: '.05em',
                        color: generandoDesc ? 'var(--panel-muted)' : 'var(--color-terracota)',
                        background: generandoDesc ? 'var(--panel-borde)' : 'rgba(160,82,45,.08)',
                        border: '1px solid ' + (generandoDesc ? 'var(--panel-borde)' : 'rgba(160,82,45,.25)'),
                        borderRadius: '4px', padding: '.25rem .65rem',
                        cursor: generandoDesc ? 'not-allowed' : 'pointer', transition: 'all .2s',
                      }}
                    >
                      {generandoDesc ? (
                        <>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                          Generando...
                        </>
                      ) : (
                        <>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
                          </svg>
                          Generar con IA
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    className="campo-textarea"
                    value={form.descripcion}
                    onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Describe la obra, su inspiración, el proceso, los materiales... (opcional)"
                    style={{ minHeight: '90px' }}
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="campo-label">Imagen</label>
                  <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem' }}>
                    {['url', 'archivo'].map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setTipoImagen(tipo)}
                        style={{
                          padding: '.35rem .85rem', borderRadius: '4px',
                          border: `1.5px solid ${tipoImagen === tipo ? 'var(--color-terracota)' : 'var(--panel-borde)'}`,
                          background: tipoImagen === tipo ? 'rgba(160,82,45,.08)' : 'transparent',
                          color: tipoImagen === tipo ? 'var(--color-terracota)' : 'var(--panel-muted)',
                          fontSize: '.75rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {tipo === 'url' ? '🌐 URL de internet' : '📁 Archivo local'}
                      </button>
                    ))}
                  </div>

                  {tipoImagen === 'url' ? (
                    <input
                      className="campo-input"
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={form.imagen_url}
                      onChange={(e) => manejarUrlImagen(e.target.value)}
                    />
                  ) : (
                    <div
                      className="upload-zona"
                      onClick={() => document.getElementById('inputImagenObra').click()}
                    >
                      <svg viewBox="0 0 24 24">
                        <polyline points="16 16 12 12 8 16"/>
                        <line x1="12" y1="12" x2="12" y2="21"/>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                      </svg>
                      <p className="upload-zona-texto">
                        {archivoImagen ? archivoImagen.name : 'Arrastra la imagen aquí o'}
                      </p>
                      <span className="upload-zona-accion">haz clic para seleccionar</span>
                      <p style={{ fontSize: '.68rem', color: 'var(--panel-muted)', marginTop: '.4rem' }}>
                        JPG, PNG o WebP
                      </p>
                      <input
                        type="file"
                        id="inputImagenObra"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={manejarArchivoSeleccionado}
                      />
                    </div>
                  )}

                  {imagenPreview && (
                    <div style={{ marginTop: '.75rem', position: 'relative', display: 'inline-block' }}>
                      <img
                        src={imagenPreview}
                        alt="Preview"
                        style={{ width: '120px', height: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--panel-borde)' }}
                        onError={() => setImagenPreview(null)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagenPreview(null);
                          setArchivoImagen(null);
                          setForm(f => ({ ...f, imagen_url: '' }));
                        }}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          background: '#c0392b', color: '#fff', border: 'none',
                          borderRadius: '50%', width: '20px', height: '20px',
                          fontSize: '.7rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >✕</button>
                    </div>
                  )}
                </div>

                {/* Disponible */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.82rem', color: 'var(--color-texto)' }}>
                    <input
                      type="checkbox"
                      checked={form.disponible}
                      onChange={(e) => setForm(f => ({ ...f, disponible: e.target.checked }))}
                    />
                    Disponible para venta
                  </label>
                </div>

              </div>
            </div>

            <div className="modal-pie">
              <button className="btn-panel btn-panel-ghost" onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
              <button className="btn-panel btn-panel-primario" onClick={guardar}>
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Guardar obra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── VISTA IMÁGENES DEL SITIO ─────────────────────────────────
function VistaImagenes({ mostrarToast }) {
  const IMAGENES_CONFIG = [
    {
      id: 'hero',
      titulo: 'Imagen Hero',
      subtitulo: 'Imagen principal de la página de inicio',
      descripcion: 'Esta imagen aparece en la sección superior de la página principal, en el lado derecho del texto de presentación.',
    },
    {
      id: 'artista',
      titulo: 'Foto de la Artista',
      subtitulo: 'Retrato de Luz Aldape en la sección biográfica',
      descripcion: 'Esta imagen aparece en la sección "La Artista" junto a la biografía y trayectoria de Luz Aldape.',
    },
  ];

  // rutasActuales guarda la ruta que devuelve el backend para cada slot
  const [rutasActuales, setRutasActuales] = useState({ hero: null, artista: null });
  const [previews, setPreviews] = useState({ hero: null, artista: null });
  const [archivos, setArchivos] = useState({ hero: null, artista: null });
  const [subiendo, setSubiendo] = useState({ hero: false, artista: false });

  useEffect(() => { cargarRutasActuales(); }, []);

  const cargarRutasActuales = async () => {
    try {
      const res = await api.get('/admin/imagenes-sitio');
      setRutasActuales(res.data);
    } catch {}
  };

  const manejarArchivo = (id, e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setArchivos(prev => ({ ...prev, [id]: archivo }));
    setPreviews(prev => ({ ...prev, [id]: URL.createObjectURL(archivo) }));
  };

  const limpiarSeleccion = (id) => {
    setArchivos(prev => ({ ...prev, [id]: null }));
    setPreviews(prev => ({ ...prev, [id]: null }));
    const input = document.getElementById(`input-img-${id}`);
    if (input) input.value = '';
  };

  const subirImagen = async (cfg) => {
    const archivo = archivos[cfg.id];
    if (!archivo) {
      mostrarToast('Selecciona una imagen primero');
      return;
    }
    setSubiendo(prev => ({ ...prev, [cfg.id]: true }));
    try {
      const formData = new FormData();
      formData.append('imagen', archivo);
      formData.append('slot', cfg.id);
      const res = await api.post('/admin/imagen-sitio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Actualizar la ruta actual con la nueva que devuelve el backend
      setRutasActuales(prev => ({ ...prev, [cfg.id]: res.data.ruta }));
      mostrarToast(`✓ ${cfg.titulo} actualizada correctamente`);
      limpiarSeleccion(cfg.id);
    } catch (err) {
      mostrarToast('Error al subir la imagen: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubiendo(prev => ({ ...prev, [cfg.id]: false }));
    }
  };

  return (
    <div className="panel-vista-anim">
      <div className="vista-cabecera">
        <div>
          <h2 className="vista-titulo">Imágenes del Sitio</h2>
          <p className="vista-descripcion">Gestiona las imágenes principales de la página de inicio</p>
        </div>
      </div>

      <div className="imagenes-sitio-grid">
        {IMAGENES_CONFIG.map((cfg) => (
          <div key={cfg.id} className="panel-card imagen-sitio-card">
            <div className="panel-card-cabecera">
              <div>
                <p className="panel-card-titulo">{cfg.titulo}</p>
                <p className="panel-card-subtitulo">{cfg.subtitulo}</p>
              </div>
            </div>

            <div className="panel-card-cuerpo">
              <p className="imagen-sitio-descripcion">{cfg.descripcion}</p>

              {/* Preview: nueva o actual */}
              <div className="imagen-sitio-previews">
                {/* Imagen actual en el servidor */}
                <div className="imagen-sitio-preview-col">
                  <span className="imagen-sitio-preview-label">Imagen actual</span>
                  <div className="imagen-sitio-preview-wrap actual">
                    <img
                      src={rutasActuales[cfg.id] ? `${rutasActuales[cfg.id]}?v=${encodeURIComponent(rutasActuales[cfg.id])}` : undefined}
                      alt={cfg.titulo}
                      style={{ display: rutasActuales[cfg.id] ? 'block' : 'none' }}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="imagen-sitio-placeholder" style={{ display: 'none' }}>
                      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span>Sin imagen</span>
                    </div>
                  </div>
                </div>

                {/* Nueva imagen seleccionada */}
                {previews[cfg.id] && (
                  <>
                    <div className="imagen-sitio-flecha">→</div>
                    <div className="imagen-sitio-preview-col">
                      <span className="imagen-sitio-preview-label nueva">Nueva imagen</span>
                      <div className="imagen-sitio-preview-wrap nueva">
                        <img src={previews[cfg.id]} alt="Preview nueva" />
                        <button
                          className="imagen-sitio-preview-quitar"
                          onClick={() => limpiarSeleccion(cfg.id)}
                          title="Quitar selección"
                        >✕</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Zona de upload */}
              <div
                className="upload-zona imagen-sitio-upload"
                onClick={() => document.getElementById(`input-img-${cfg.id}`).click()}
              >
                <svg viewBox="0 0 24 24">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                <p className="upload-zona-texto">
                  {archivos[cfg.id] ? archivos[cfg.id].name : 'Arrastra aquí o'}
                </p>
                <span className="upload-zona-accion">selecciona una imagen</span>
                <p style={{ fontSize: '.68rem', color: 'var(--panel-muted)', marginTop: '.3rem' }}>
                  JPG, PNG o WebP · Reemplazará la imagen actual en el servidor
                </p>
                <input
                  type="file"
                  id={`input-img-${cfg.id}`}
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => manejarArchivo(cfg.id, e)}
                />
              </div>

              {/* Botón subir */}
              <button
                className={`btn-panel btn-panel-primario imagen-sitio-btn ${!archivos[cfg.id] ? 'disabled' : ''}`}
                onClick={() => subirImagen(cfg)}
                disabled={!archivos[cfg.id] || subiendo[cfg.id]}
                style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', opacity: !archivos[cfg.id] ? 0.5 : 1 }}
              >
                {subiendo[cfg.id] ? (
                  <>
                    <svg viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/></svg>
                    Actualizar {cfg.titulo}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Nota informativa */}
      <div className="panel-card" style={{ marginTop: '1.5rem', background: 'rgba(160,82,45,.04)', border: '1.5px solid rgba(160,82,45,.15)' }}>
        <div className="panel-card-cuerpo" style={{ padding: '1rem 1.5rem' }}>
          <p style={{ fontSize: '.82rem', color: 'var(--panel-muted)', lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: 'var(--color-terracota)' }}>ℹ️ Nota técnica:</strong> Las imágenes se guardan directamente en la carpeta{' '}
            <code style={{ background: 'var(--panel-borde)', padding: '.1rem .4rem', borderRadius: '3px', fontSize: '.78rem' }}>/public/imagenes/</code>{' '}
            del servidor. Una vez actualizada, la imagen se reflejará en el sitio de inmediato al recargar la página.
            Si el cambio no se ve de inmediato, limpia el caché del navegador con{' '}
            <kbd style={{ background: 'var(--panel-borde)', padding: '.1rem .4rem', borderRadius: '3px', fontSize: '.78rem' }}>Ctrl+Shift+R</kbd>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── VISTA COLECCIONES ────────────────────────────────────────
function VistaColecciones({ mostrarToast }) {
  const [colecciones, setColecciones] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [editando, setEditando] = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const res = await api.get('/colecciones');
      setColecciones(res.data);
    } catch {}
  };

  const abrirCrear = () => { setEditando(null); setForm({ nombre: '', descripcion: '' }); setModalAbierto(true); };
  const abrirEditar = (c) => { setEditando(c); setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); setModalAbierto(true); };

  const guardar = async () => {
    try {
      if (editando) {
        await api.put(`/colecciones/${editando.id}`, form);
        mostrarToast('Colección actualizada');
      } else {
        await api.post('/colecciones', form);
        mostrarToast('Colección creada');
      }
      setModalAbierto(false);
      cargar();
    } catch { mostrarToast('Error al guardar'); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta colección?')) return;
    try { await api.delete(`/colecciones/${id}`); mostrarToast('Colección eliminada'); cargar(); } catch {}
  };

  return (
    <div className="panel-vista-anim">
      <div className="vista-cabecera">
        <div><h2 className="vista-titulo">Colecciones</h2><p className="vista-descripcion">Organiza los tapices por colección</p></div>
        <button className="btn-panel btn-panel-primario" onClick={abrirCrear}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva colección
        </button>
      </div>
      <div className="tabla-wrap">
        <table className="tabla">
          <thead><tr><th>Nombre</th><th>Descripción</th><th>Fecha creación</th><th>Acciones</th></tr></thead>
          <tbody>
            {colecciones.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--panel-muted)' }}>No hay colecciones registradas.</td></tr>
            ) : colecciones.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.nombre}</strong></td>
                <td>{c.descripcion || '—'}</td>
                <td>{c.fecha_creacion ? new Date(c.fecha_creacion).toLocaleDateString('es-MX') : '—'}</td>
                <td>
                  <div className="tabla-acciones">
                    <button className="tabla-btn-accion" onClick={() => abrirEditar(c)}>
                      <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="tabla-btn-accion peligro" onClick={() => eliminar(c.id)}>
                      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tabla-pie"><span className="paginacion-info">Mostrando {colecciones.length} colecciones</span></div>
      </div>

      {modalAbierto && (
        <div className="panel-modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-tarjeta" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h3 className="modal-titulo">{editando ? 'Editar colección' : 'Nueva colección'}</h3>
              <button className="modal-btn-cerrar" onClick={() => setModalAbierto(false)}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="modal-cuerpo">
              <div className="campo" style={{ marginBottom: '1rem' }}>
                <label className="campo-label">Nombre</label>
                <input className="campo-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Sellos Prehispánicos" />
              </div>
              <div className="campo">
                <label className="campo-label">Descripción</label>
                <textarea className="campo-textarea" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción de la colección..." />
              </div>
            </div>
            <div className="modal-pie">
              <button className="btn-panel btn-panel-ghost" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="btn-panel btn-panel-primario" onClick={guardar}>
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── VISTA PEDIDOS ────────────────────────────────────────────
function VistaPedidos({ mostrarToast }) {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const res = await api.get('/admin/pedidos');
      setPedidos(res.data);
    } catch {}
  };

  const badgeEstado = (estado) => {
    const mapa = { pendiente: 'badge-apartada', pagado: 'badge-disponible', enviado: 'badge-nuevo', entregado: 'badge-disponible', cancelado: 'badge-vendida' };
    return mapa[estado] || 'badge-vendida';
  };

  return (
    <div className="panel-vista-anim">
      <div className="vista-cabecera">
        <div><h2 className="vista-titulo">Pedidos</h2><p className="vista-descripcion">Historial y estado de todos los pedidos</p></div>
      </div>
      <div className="tabla-wrap">
        <table className="tabla">
          <thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Referencia pago</th><th>Fecha</th></tr></thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--panel-muted)' }}>No hay pedidos registrados.</td></tr>
            ) : pedidos.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.usuario || '—'}</td>
                <td>${parseFloat(p.total).toLocaleString('es-MX')} MXN</td>
                <td><span className={`badge ${badgeEstado(p.estado)}`}>{p.estado}</span></td>
                <td style={{ fontSize: '.75rem', color: 'var(--panel-muted)' }}>{p.referencia_pago || '—'}</td>
                <td>{p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString('es-MX') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tabla-pie"><span className="paginacion-info">Mostrando {pedidos.length} pedidos</span></div>
      </div>
    </div>
  );
}

// ── VISTA USUARIOS ───────────────────────────────────────────
function VistaUsuarios({ mostrarToast }) {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAdmin, setModalAdmin] = useState(false);
  const [formAdmin, setFormAdmin] = useState({ nombre: '', email: '', password: '' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const res = await api.get('/admin/usuarios');
      setUsuarios(res.data);
    } catch {}
  };

  const crearAdmin = async () => {
    try {
      await api.post('/admin/usuarios', { ...formAdmin, rol: 'admin' });
      mostrarToast('Administrador creado correctamente');
      setModalAdmin(false);
      setFormAdmin({ nombre: '', email: '', password: '' });
      cargar();
    } catch { mostrarToast('Error al crear administrador'); }
  };

  return (
    <div className="panel-vista-anim">
      <div className="vista-cabecera">
        <div><h2 className="vista-titulo">Usuarios</h2><p className="vista-descripcion">Lista de clientes y administradores</p></div>
        <button className="btn-panel btn-panel-primario" onClick={() => setModalAdmin(true)}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo administrador
        </button>
      </div>
      <div className="tabla-wrap">
        <table className="tabla">
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Fecha registro</th></tr></thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--panel-muted)' }}>No hay usuarios registrados.</td></tr>
            ) : usuarios.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.nombre}</strong></td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.rol === 'admin' ? 'badge-urgente' : 'badge-disponible'}`}>{u.rol}</span></td>
                <td>{u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString('es-MX') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tabla-pie"><span className="paginacion-info">Mostrando {usuarios.length} usuarios</span></div>
      </div>

      {modalAdmin && (
        <div className="panel-modal-overlay" onClick={() => setModalAdmin(false)}>
          <div className="modal-tarjeta" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h3 className="modal-titulo">Nuevo administrador</h3>
              <button className="modal-btn-cerrar" onClick={() => setModalAdmin(false)}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="modal-cuerpo">
              <div className="campo" style={{ marginBottom: '1rem' }}>
                <label className="campo-label">Nombre completo</label>
                <input className="campo-input" value={formAdmin.nombre} onChange={(e) => setFormAdmin({ ...formAdmin, nombre: e.target.value })} placeholder="Nombre del administrador" />
              </div>
              <div className="campo" style={{ marginBottom: '1rem' }}>
                <label className="campo-label">Correo electrónico</label>
                <input className="campo-input" type="email" value={formAdmin.email} onChange={(e) => setFormAdmin({ ...formAdmin, email: e.target.value })} placeholder="admin@correo.com" />
              </div>
              <div className="campo">
                <label className="campo-label">Contraseña</label>
                <input className="campo-input" type="password" value={formAdmin.password} onChange={(e) => setFormAdmin({ ...formAdmin, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            <div className="modal-pie">
              <button className="btn-panel btn-panel-ghost" onClick={() => setModalAdmin(false)}>Cancelar</button>
              <button className="btn-panel btn-panel-primario" onClick={crearAdmin}>
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Crear administrador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}