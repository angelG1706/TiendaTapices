import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Auth
  usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
  token: localStorage.getItem('token') || null,

  login: (usuario, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    set({ usuario, token, carrito: [], carritoAbierto: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    set({ usuario: null, token: null, carrito: [], carritoAbierto: false });
  },

  // Carrito
  carrito: [],
  carritoAbierto: false,

  setCarrito: (carrito) => set({ carrito }),

  agregarAlCarrito: (item) => {
    const carrito = get().carrito;
    const existe = carrito.find((i) => i.tapiz_id === item.tapiz_id);
    if (existe) return;
    set({ carrito: [...carrito, item] });
  },

  quitarDelCarrito: (id) => {
    set({ carrito: get().carrito.filter((i) => i.id !== id) });
  },

  abrirCarrito: () => set({ carritoAbierto: true }),
  cerrarCarrito: () => set({ carritoAbierto: false }),

  // Auth modal
  authModal: null, // 'login' | 'registro' | null
  abrirLogin: () => set({ authModal: 'login' }),
  abrirRegistro: () => set({ authModal: 'registro' }),
  cerrarAuth: () => set({ authModal: null }),
}));

export default useStore;