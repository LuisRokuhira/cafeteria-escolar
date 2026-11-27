/*
 * carrito.js — Lógica de negocio del carrito (sin acceso al DOM).
 * Se mantiene separada de la interfaz para poder probarla en pruebas.html.
 */
const Carrito = (() => {
  const MAX_POR_PRODUCTO = 10;

  /** Agrega una unidad de un producto. Devuelve un carrito nuevo. */
  function agregar(carrito, producto) {
    if (!producto || !producto.disponible) {
      throw new Error('Producto no disponible');
    }
    const items = carrito.map(i => ({ ...i }));
    const existente = items.find(i => i.id === producto.id);
    if (existente) {
      if (existente.cantidad >= MAX_POR_PRODUCTO) {
        throw new Error(`Máximo ${MAX_POR_PRODUCTO} unidades por producto`);
      }
      existente.cantidad += 1;
    } else {
      items.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
    }
    return items;
  }

  /** Cambia la cantidad de un producto; si llega a 0 se elimina. */
  function cambiarCantidad(carrito, id, delta) {
    return carrito
      .map(i => (i.id === id ? { ...i, cantidad: Math.min(MAX_POR_PRODUCTO, i.cantidad + delta) } : { ...i }))
      .filter(i => i.cantidad > 0);
  }

  function eliminar(carrito, id) {
    return carrito.filter(i => i.id !== id).map(i => ({ ...i }));
  }

  function totalArticulos(carrito) {
    return carrito.reduce((s, i) => s + i.cantidad, 0);
  }

  function subtotal(carrito) {
    return carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  }

  /** Valida los datos del formulario de pedido. Devuelve una lista de errores. */
  function validarPedido(datos, carrito) {
    const errores = [];
    if (!carrito || carrito.length === 0) errores.push('El carrito está vacío');
    if (!datos.nombre || datos.nombre.trim().length < 3) errores.push('Escribe tu nombre (mínimo 3 letras)');
    if (!/^[1-6][A-Za-z]$/.test((datos.grupo || '').trim())) errores.push('Grupo inválido (ejemplo: 5A)');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(datos.hora || '')) {
      errores.push('Selecciona una hora de entrega');
    } else {
      const [h, m] = datos.hora.split(':').map(Number);
      const minutos = h * 60 + m;
      if (minutos < 7 * 60 || minutos > 15 * 60) errores.push('La cafetería entrega de 07:00 a 15:00');
    }
    return errores;
  }

  /** Genera un folio único: CAF-AAAAMMDD-XXXX */
  function generarFolio(fecha = new Date()) {
    const f = fecha.getFullYear() +
      String(fecha.getMonth() + 1).padStart(2, '0') +
      String(fecha.getDate()).padStart(2, '0');
    const azar = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CAF-${f}-${azar}`;
  }

  function formatoMoneda(n) {
    return '$' + n.toFixed(2);
  }

  return { agregar, cambiarCantidad, eliminar, totalArticulos, subtotal, validarPedido, generarFolio, formatoMoneda, MAX_POR_PRODUCTO };
})();

if (typeof module !== 'undefined') module.exports = Carrito;
