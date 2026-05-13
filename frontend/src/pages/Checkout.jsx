import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import useTienda from '../store/tienda';
import api from '../services/api';

const resolverImagen = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `http://127.0.0.1:8000${img}`;
};

export default function Checkout() {
  const { usuario, carrito, setCarrito } = useTienda();
  const [paso, setPaso] = useState(1); // 1: resumen, 2: dirección, 3: pago
  const [direcciones, setDirecciones] = useState([]);
  const [direccionId, setDireccionId] = useState(null);
  const [pedidoId, setPedidoId] = useState(null); // set by payment endpoint
  const [metodoPago, setMetodoPago] = useState(null);
  const [referenciaPago, setReferenciaPago] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState({
    calle: '', colonia: '', ciudad: '', estado: '',
    codigo_postal: '', pais: 'México', predeterminada: false
  });
  const [mostrarFormDireccion, setMostrarFormDireccion] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: '', nombre: '', expMes: '', expAnio: '', cvc: ''
  });
  const [procesandoTarjeta, setProcesandoTarjeta] = useState(false);

  const total = carrito.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);

  useEffect(() => {
    if (!usuario) {
      window.location.href = '/';
      return;
    }
    cargarCarrito();
    cargarDirecciones();
  }, []);

  const cargarCarrito = async () => {
    try {
      const res = await api.get('/carrito');
      setCarrito(res.data.items || []);
    } catch {}
  };

  const cargarDirecciones = async () => {
    try {
      const res = await api.get('/direcciones');
      setDirecciones(res.data);
      const predeterminada = res.data.find(d => d.predeterminada);
      if (predeterminada) setDireccionId(predeterminada.id);
      else if (res.data.length > 0) setDireccionId(res.data[0].id);
    } catch {}
  };

  const guardarDireccion = async () => {
    const camposObligatorios = ['calle', 'colonia', 'ciudad', 'estado', 'codigo_postal'];
    const vacio = camposObligatorios.find(c => !nuevaDireccion[c]?.trim());
    if (vacio) {
      const nombres = { calle: 'Calle', colonia: 'Colonia', ciudad: 'Ciudad', estado: 'Estado', codigo_postal: 'Código postal' };
      setError(`El campo "${nombres[vacio]}" es obligatorio.`);
      return;
    }
    if (!/^\d{5}$/.test(nuevaDireccion.codigo_postal.trim())) {
      setError('El código postal debe tener exactamente 5 dígitos.');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const res = await api.post('/direcciones', nuevaDireccion);
      await cargarDirecciones();
      setDireccionId(res.data.id);
      setMostrarFormDireccion(false);
      setNuevaDireccion({ calle: '', colonia: '', ciudad: '', estado: '', codigo_postal: '', pais: 'México', predeterminada: false });
    } catch {
      setError('Error al guardar la dirección');
    } finally {
      setCargando(false);
    }
  };

  const crearPedido = () => {
    if (!direccionId) {
      setError('Selecciona una dirección de envío');
      return;
    }
    setError('');
    setPaso(3);
  };

  const pagarOxxo = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await api.post('/pagos/oxxo', { direccion_id: direccionId });
      setPedidoId(res.data.pedido_id);
      setReferenciaPago(res.data);
      await cargarCarrito();
      setMetodoPago('oxxo');
    } catch (err) {
      setError('Error al generar referencia OXXO');
    } finally {
      setCargando(false);
    }
  };

const pagarTarjeta = async () => {
  if (!datosTarjeta.numero || !datosTarjeta.nombre || !datosTarjeta.expMes || !datosTarjeta.expAnio || !datosTarjeta.cvc) {
    setError('Completa todos los campos de la tarjeta');
    return;
  }

  setProcesandoTarjeta(true);
  setError('');

  window.Conekta.setPublicKey('key_Bp0qBMaB3Fa20eU9FMk7dyz');

  window.Conekta.Token.create(
    {
      card: {
        number:    datosTarjeta.numero.replace(/\s/g, ''),
        name:      datosTarjeta.nombre,
        exp_year:  datosTarjeta.expAnio,
        exp_month: datosTarjeta.expMes.padStart(2, '0'),
        cvc:       datosTarjeta.cvc,
      }
    },
    async (token) => {
      try {
        const res = await api.post('/pagos/tarjeta', {
          direccion_id: direccionId,
          token_id: token.id,
        });
        setPedidoId(res.data.pedido_id);
        setReferenciaPago({ ...res.data, tipo: 'tarjeta' });
        await cargarCarrito();
        setMetodoPago('tarjeta');
      } catch (err) {
        setError('Error al procesar el pago: ' + (err.response?.data?.detalle || err.message));
      } finally {
        setProcesandoTarjeta(false);
      }
    },
    (err) => {
      setError('Tarjeta inválida: ' + (err.message_to_purchaser || err.message));
      setProcesandoTarjeta(false);
    }
  );
};

  if (!usuario) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--crema)', paddingTop: '80px' }}>

      {/* ── NAVBAR SIMPLE ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(250,246,240,.97)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--arena-dark)', padding: '.7rem 0',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--terracota)' }}>
            Luz Aldape
          </a>
          <span style={{ fontSize: '.82rem', color: '#9a7a60' }}>Proceso de compra</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>

        {/* ── COLUMNA IZQUIERDA ── */}
        <div>

          {/* Pasos */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '2rem' }}>
            {[
              { n: 1, label: 'Resumen' },
              { n: 2, label: 'Dirección' },
              { n: 3, label: 'Pago' },
            ].map((p, i) => (
              <div key={p.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: paso >= p.n ? 'var(--terracota)' : 'var(--arena-dark)',
                  color: paso >= p.n ? '#fff' : '#9a7a60',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.8rem', fontWeight: 700,
                }}>{p.n}</div>
                <span style={{ marginLeft: '.5rem', fontSize: '.8rem', fontWeight: paso === p.n ? 600 : 400, color: paso >= p.n ? 'var(--terracota)' : '#9a7a60' }}>
                  {p.label}
                </span>
                {i < 2 && <div style={{ flex: 1, height: 2, background: paso > p.n ? 'var(--terracota)' : 'var(--arena-dark)', margin: '0 .75rem' }} />}
              </div>
            ))}
          </div>

          {/* ── PASO 1: RESUMEN ── */}
          {paso === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--texto)' }}>
                Tu selección
              </h2>

              {carrito.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 8, border: '1px solid var(--arena-dark)' }}>
                  <p style={{ color: '#9a7a60' }}>Tu carrito está vacío.</p>
                  <a href="/" className="btn-terracota" style={{ marginTop: '1rem', display: 'inline-flex' }}>Ver catálogo</a>
                </div>
              ) : (
                <>
                  {carrito.map((item) => {
                    const img = resolverImagen(item.imagen);
                    return (
                      <div key={item.id} style={{
                        display: 'flex', gap: '1.25rem', padding: '1.25rem',
                        background: '#fff', borderRadius: 8,
                        border: '1px solid var(--arena-dark)', marginBottom: '1rem',
                      }}>
                        <div style={{
                          width: 90, height: 112, flexShrink: 0, borderRadius: 6,
                          background: 'var(--arena)', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {img ? (
                            <img src={img} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <svg viewBox="0 0 40 40" style={{ width: 32, opacity: .3, stroke: 'var(--terracota)', fill: 'none', strokeWidth: 1 }}>
                              <rect x="4" y="4" width="32" height="32"/>
                              <path d="M14 4v32M26 4v32M4 14h32M4 26h32"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--terracota-light)', marginBottom: '.2rem' }}>
                            {item.tecnica}
                          </p>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--texto)', marginBottom: '.25rem' }}>
                            {item.titulo}
                          </h3>
                          <p style={{ fontSize: '.78rem', color: '#9a7a60', marginBottom: '.5rem' }}>{item.medidas || '—'}</p>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--terracota)' }}>
                            ${parseFloat(item.precio).toLocaleString('es-MX')} MXN
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button className="btn-terracota" onClick={() => setPaso(2)}>
                      Continuar →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── PASO 2: DIRECCIÓN ── */}
          {paso === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--texto)' }}>
                Dirección de envío
              </h2>

              {direcciones.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  {direcciones.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setDireccionId(d.id)}
                      style={{
                        padding: '1rem 1.25rem', marginBottom: '.75rem',
                        background: '#fff', borderRadius: 8,
                        border: `2px solid ${direccionId === d.id ? 'var(--terracota)' : 'var(--arena-dark)'}`,
                        cursor: 'pointer', transition: 'border-color .2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: `2px solid ${direccionId === d.id ? 'var(--terracota)' : 'var(--arena-dark)'}`,
                          background: direccionId === d.id ? 'var(--terracota)' : 'transparent',
                          flexShrink: 0,
                        }} />
                        <div>
                          <p style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--texto)' }}>
                            {d.calle}, {d.colonia}
                          </p>
                          <p style={{ fontSize: '.82rem', color: '#9a7a60' }}>
                            {d.ciudad}, {d.estado} {d.codigo_postal} · {d.pais}
                          </p>
                        </div>
                        {d.predeterminada && (
                          <span style={{ marginLeft: 'auto', fontSize: '.65rem', fontWeight: 600, color: 'var(--terracota)', background: 'rgba(160,82,45,.1)', padding: '.2rem .6rem', borderRadius: 20 }}>
                            Predeterminada
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setMostrarFormDireccion(!mostrarFormDireccion)}
                className="btn-outline-terracota"
                style={{ marginBottom: '1.5rem' }}
              >
                {mostrarFormDireccion ? '✕ Cancelar' : '+ Agregar nueva dirección'}
              </button>

              {mostrarFormDireccion && (
                <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--arena-dark)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                      { label: 'Calle y número', key: 'calle', placeholder: 'Av. Reforma 123', full: true },
                      { label: 'Colonia', key: 'colonia', placeholder: 'Centro' },
                      { label: 'Ciudad', key: 'ciudad', placeholder: 'Veracruz' },
                      { label: 'Estado', key: 'estado', placeholder: 'Veracruz' },
                      { label: 'Código postal', key: 'codigo_postal', placeholder: '91700' },
                      { label: 'País', key: 'pais', placeholder: 'México' },
                    ].map((campo) => (
                      <div key={campo.key} style={{ gridColumn: campo.full ? '1/-1' : 'auto' }}>
                        <label style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--texto-suave)', display: 'block', marginBottom: '.35rem' }}>
                          {campo.label}
                        </label>
                        <input
                          style={{ width: '100%', padding: '.6rem .9rem', border: '1.5px solid var(--arena-dark)', borderRadius: 4, fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                          placeholder={campo.placeholder}
                          value={nuevaDireccion[campo.key]}
                          onChange={(e) => setNuevaDireccion(d => ({ ...d, [campo.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-terracota" onClick={guardarDireccion} disabled={cargando}>
                      {cargando ? 'Guardando...' : 'Guardar dirección'}
                    </button>
                  </div>
                </div>
              )}

              {error && <p style={{ color: '#c0392b', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</p>}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button className="btn-outline-terracota" onClick={() => setPaso(1)}>← Volver</button>
                <button className="btn-terracota" onClick={crearPedido} disabled={cargando || !direccionId}>
                  {cargando ? 'Procesando...' : 'Confirmar pedido →'}
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 3: PAGO ── */}
          {paso === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '.5rem', color: 'var(--texto)' }}>
                Elige cómo quieres pagar
              </h2>

              {!referenciaPago ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* OXXO */}
                  <div style={{
                    padding: '1.5rem', background: '#fff', borderRadius: 8,
                    border: '1.5px solid var(--arena-dark)', cursor: 'pointer',
                    transition: 'all .2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.75rem' }}>
                      <span style={{ fontSize: '1.75rem' }}>🏪</span>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--texto)' }}>OXXO</p>
                        <p style={{ fontSize: '.8rem', color: '#9a7a60' }}>Paga en efectivo en cualquier tienda OXXO</p>
                      </div>
                    </div>
                    <button className="btn-terracota" style={{ width: '100%', justifyContent: 'center' }} onClick={pagarOxxo} disabled={cargando}>
                      {cargando ? 'Generando referencia...' : 'Pagar con OXXO'}
                    </button>
                  </div>

                  {/* TARJETA */}
                  <div style={{
                    padding: '1.5rem', background: '#fff', borderRadius: 8,
                    border: '1.5px solid var(--arena-dark)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '1.75rem' }}>💳</span>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--texto)' }}>Tarjeta de crédito o débito</p>
                        <p style={{ fontSize: '.8rem', color: '#9a7a60' }}>Pago seguro procesado por Conekta</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                      <div>
                        <label style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--texto-suave)', display: 'block', marginBottom: '.35rem' }}>
                          Número de tarjeta
                        </label>
                        <input
                          style={{ width: '100%', padding: '.6rem .9rem', border: '1.5px solid var(--arena-dark)', borderRadius: 4, fontFamily: 'monospace', fontSize: '1rem', color: 'var(--texto)', background: 'var(--crema)', outline: 'none', letterSpacing: '.1em' }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={datosTarjeta.numero}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                            setDatosTarjeta(d => ({ ...d, numero: val }));
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--texto-suave)', display: 'block', marginBottom: '.35rem' }}>
                          Nombre en la tarjeta
                        </label>
                        <input
                          style={{ width: '100%', padding: '.6rem .9rem', border: '1.5px solid var(--arena-dark)', borderRadius: 4, fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                          placeholder="Como aparece en la tarjeta"
                          value={datosTarjeta.nombre}
                          onChange={(e) => setDatosTarjeta(d => ({ ...d, nombre: e.target.value }))}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.75rem' }}>
                        <div>
                          <label style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--texto-suave)', display: 'block', marginBottom: '.35rem' }}>
                            Mes exp.
                          </label>
                          <input
                            style={{ width: '100%', padding: '.6rem .9rem', border: '1.5px solid var(--arena-dark)', borderRadius: 4, fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                            placeholder="MM"
                            maxLength={2}
                            value={datosTarjeta.expMes}
                            onChange={(e) => setDatosTarjeta(d => ({ ...d, expMes: e.target.value.replace(/\D/g, '') }))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--texto-suave)', display: 'block', marginBottom: '.35rem' }}>
                            Año exp.
                          </label>
                          <input
                            style={{ width: '100%', padding: '.6rem .9rem', border: '1.5px solid var(--arena-dark)', borderRadius: 4, fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                            placeholder="AAAA"
                            maxLength={4}
                            value={datosTarjeta.expAnio}
                            onChange={(e) => setDatosTarjeta(d => ({ ...d, expAnio: e.target.value.replace(/\D/g, '') }))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--texto-suave)', display: 'block', marginBottom: '.35rem' }}>
                            CVC
                          </label>
                          <input
                            style={{ width: '100%', padding: '.6rem .9rem', border: '1.5px solid var(--arena-dark)', borderRadius: 4, fontFamily: 'monospace', fontSize: '.9rem', color: 'var(--texto)', background: 'var(--crema)', outline: 'none', letterSpacing: '.1em' }}
                            placeholder="123"
                            maxLength={4}
                            value={datosTarjeta.cvc}
                            onChange={(e) => setDatosTarjeta(d => ({ ...d, cvc: e.target.value.replace(/\D/g, '') }))}
                          />
                        </div>
                      </div>

                      <div style={{ background: 'rgba(160,82,45,.04)', border: '1px solid rgba(160,82,45,.15)', borderRadius: 6, padding: '.75rem 1rem', fontSize: '.75rem', color: 'var(--texto-suave)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        🔒 Pago seguro. Tus datos se cifran con SSL y nunca se almacenan en nuestros servidores.
                      </div>

                      <button
                        className="btn-terracota"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={pagarTarjeta}
                        disabled={procesandoTarjeta}
                      >
                        {procesandoTarjeta ? 'Procesando...' : `Pagar $${total.toLocaleString('es-MX')} MXN`}
                      </button>
                    </div>
                  </div>

                  {/* PAYPAL */}
                  <div style={{
                    padding: '1.5rem', background: '#fff', borderRadius: 8,
                    border: '1.5px solid var(--arena-dark)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '1.75rem' }}>🅿️</span>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--texto)' }}>PayPal</p>
                        <p style={{ fontSize: '.8rem', color: '#9a7a60' }}>Pago seguro procesado por PayPal</p>
                      </div>
                    </div>
                    <PayPalScriptProvider options={{
                      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
                      currency: 'MXN',
                    }}>
                      <PayPalButtons
                        style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
                        createOrder={async () => {
                          const res = await api.post('/pagos/paypal', { direccion_id: direccionId });
                          setPedidoId(res.data.pedido_id);
                          return res.data.paypal_order_id;
                        }}
                        onApprove={async (data) => {
                          try {
                            const capRes = await api.post(`/pagos/paypal/${pedidoId}/capturar`, {
                              paypal_order_id: data.orderID,
                            });
                            setReferenciaPago({ ...capRes.data, tipo: 'paypal' });
                            await cargarCarrito();
                            setMetodoPago('paypal');
                            setCarrito([]);
                          } catch (err) {
                            setError('Error al capturar el pago de PayPal');
                          }
                        }}
                        onError={(err) => {
                          setError('Error en PayPal: ' + err);
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>

                  {/* En persona */}
                  <div style={{
                    padding: '1.5rem', background: '#fff', borderRadius: 8,
                    border: '1.5px solid var(--arena-dark)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.75rem' }}>
                      <span style={{ fontSize: '1.75rem' }}>🤝</span>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--texto)' }}>En persona</p>
                        <p style={{ fontSize: '.8rem', color: '#9a7a60' }}>Coordina el pago directamente con Luz Aldape</p>
                      </div>
                    </div>
                    <a href="#contacto" className="btn-outline-terracota" style={{ width: '100%', justifyContent: 'center' }}>
                      Contactar a la artista
                    </a>
                  </div>

                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 8, border: '2px solid var(--terracota)', padding: '2rem', textAlign: 'center' }}>

                  {metodoPago === 'tarjeta' || metodoPago === 'paypal' ? (
                    <>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--texto)', marginBottom: '.5rem' }}>
                        ¡Pago exitoso!
                      </h3>
                      <p style={{ fontSize: '.85rem', color: '#9a7a60', marginBottom: '1.5rem' }}>
                        {metodoPago === 'paypal' ? 'Tu pago con PayPal fue procesado correctamente.' : 'Tu pago con tarjeta fue procesado correctamente.'}
                      </p>
                      <div style={{ background: 'var(--arena)', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: '#9a7a60', marginBottom: '.5rem' }}>
                          Orden
                        </p>
                        <p style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: 'var(--terracota)', wordBreak: 'break-all' }}>
                          {referenciaPago.order_id}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--texto)', marginBottom: '.5rem' }}>
                        ¡Referencia generada!
                      </h3>
                      <p style={{ fontSize: '.85rem', color: '#9a7a60', marginBottom: '1.5rem' }}>
                        Presenta esta referencia en cualquier tienda OXXO
                      </p>
                      <div style={{ background: 'var(--arena)', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: '#9a7a60', marginBottom: '.5rem' }}>
                          Referencia de pago
                        </p>
                        <p style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 700, color: 'var(--terracota)', letterSpacing: '.1em', wordBreak: 'break-all' }}>
                          {referenciaPago.referencia}
                        </p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                        <div style={{ background: 'var(--gris-suave)', borderRadius: 6, padding: '1rem' }}>
                          <p style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', color: '#9a7a60', marginBottom: '.25rem' }}>Total a pagar</p>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--texto)' }}>
                            ${parseFloat(referenciaPago.total).toLocaleString('es-MX')} MXN
                          </p>
                        </div>
                        <div style={{ background: 'var(--gris-suave)', borderRadius: 6, padding: '1rem' }}>
                          <p style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', color: '#9a7a60', marginBottom: '.25rem' }}>Vence el</p>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--texto)' }}>
                            {referenciaPago.expira}
                          </p>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(160,82,45,.06)', border: '1px solid rgba(160,82,45,.2)', borderRadius: 6, padding: '1rem', fontSize: '.82rem', color: 'var(--texto-suave)', textAlign: 'left', marginBottom: '1.5rem' }}>
                        <strong>¿Cómo pagar?</strong> Ve a cualquier tienda OXXO, dile al cajero que quieres hacer un pago de servicio y proporciona la referencia. Conserva tu ticket como comprobante.
                      </div>
                    </>
                  )}

                  <a href="/" className="btn-outline-terracota" style={{ display: 'inline-flex' }}>
                    Volver al catálogo
                  </a>

                </div>
              )}

              {error && <p style={{ color: '#c0392b', fontSize: '.85rem', marginTop: '1rem' }}>{error}</p>}
            </div>
          )}

        </div>

        {/* ── COLUMNA DERECHA: RESUMEN ── */}
        <div style={{
          background: '#fff', borderRadius: 8,
          border: '1px solid var(--arena-dark)',
          padding: '1.5rem', position: 'sticky', top: '100px',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--texto)', marginBottom: '1.25rem' }}>
            Resumen del pedido
          </h3>

          {carrito.map((item) => {
            const img = resolverImagen(item.imagen);
            return (
              <div key={item.id} style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--arena-dark)' }}>
                <div style={{ width: 52, height: 64, flexShrink: 0, borderRadius: 4, background: 'var(--arena)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {img ? (
                    <img src={img} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg viewBox="0 0 40 40" style={{ width: 24, opacity: .3, stroke: 'var(--terracota)', fill: 'none', strokeWidth: 1 }}>
                      <rect x="4" y="4" width="32" height="32"/>
                      <path d="M14 4v32M26 4v32M4 14h32M4 26h32"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--texto)', marginBottom: '.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.titulo}
                  </p>
                  <p style={{ fontSize: '.75rem', color: 'var(--terracota)', fontWeight: 600 }}>
                    ${parseFloat(item.precio).toLocaleString('es-MX')} MXN
                  </p>
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.5rem' }}>
            <span style={{ fontSize: '.82rem', color: '#9a7a60', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--terracota)' }}>
              ${total.toLocaleString('es-MX')} MXN
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}