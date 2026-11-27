/*
 * app.js — Interfaz de la aplicación (DOM, eventos, almacenamiento local).
 */
(() => {
  const CLAVE_CARRITO = 'cafeteria.carrito';
  const CLAVE_PEDIDOS = 'cafeteria.pedidos';

  let menu = [];
  let carrito = leer(CLAVE_CARRITO, []);
  let categoriaActiva = 'Todas';

  const $ = sel => document.querySelector(sel);

  // ---------- Almacenamiento ----------
  function leer(clave, defecto) {
    try { return JSON.parse(localStorage.getItem(clave)) ?? defecto; } catch { return defecto; }
  }
  function guardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* almacenamiento no disponible */ }
  }

  // ---------- Carga del menú ----------
  async function cargarMenu() {
    try {
      const resp = await fetch('data/menu.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      menu = await resp.json();
    } catch (e) {
      console.warn('No se pudo leer data/menu.json, se usa el menú de respaldo.', e);
      menu = MENU_RESPALDO;
    }
    pintarCategorias();
    pintarProductos();
  }

  // ---------- Menú ----------
  function pintarCategorias() {
    const cats = ['Todas', ...new Set(menu.map(p => p.categoria))];
    $('#categorias').innerHTML = cats
      .map(c => `<button class="chip ${c === categoriaActiva ? 'activo' : ''}" data-cat="${c}">${c}</button>`)
      .join('');
  }

  function pintarProductos() {
    const texto = $('#buscar').value.trim().toLowerCase();
    const visibles = menu.filter(p =>
      (categoriaActiva === 'Todas' || p.categoria === categoriaActiva) &&
      p.nombre.toLowerCase().includes(texto));
    $('#lista-productos').innerHTML = visibles.map(p => `
      <article class="producto ${p.disponible ? '' : 'agotado'}" data-id="${p.id}">
        <span class="emoji" aria-hidden="true">${p.emoji}</span>
        <h3>${p.nombre}</h3>
        <span class="cat">${p.categoria}</span>
        <span class="precio">${Carrito.formatoMoneda(p.precio)}</span>
        <button class="btn-agregar" data-id="${p.id}" ${p.disponible ? '' : 'disabled'}>
          ${p.disponible ? 'Agregar' : 'Agotado'}
        </button>
      </article>`).join('');
    $('#sin-resultados').hidden = visibles.length > 0;
  }

  // ---------- Carrito ----------
  function pintarCarrito() {
    $('#items-carrito').innerHTML = carrito.map(i => `
      <li>
        <span>${i.nombre}<br><span class="item-sub">${Carrito.formatoMoneda(i.precio)} c/u</span></span>
        <span class="cant">
          <button data-accion="menos" data-id="${i.id}" aria-label="Quitar uno">−</button>
          <span>${i.cantidad}</span>
          <button data-accion="mas" data-id="${i.id}" aria-label="Agregar uno">+</button>
        </span>
      </li>`).join('');
    $('#carrito-vacio').hidden = carrito.length > 0;
    $('#total').textContent = Carrito.formatoMoneda(Carrito.subtotal(carrito));
    $('#total-articulos').textContent = Carrito.totalArticulos(carrito);
    guardar(CLAVE_CARRITO, carrito);
  }

  // ---------- Pedidos ----------
  function pintarPedidos() {
    const pedidos = leer(CLAVE_PEDIDOS, []);
    $('#contador-pedidos').textContent = pedidos.length;
    $('#pedidos-vacio').hidden = pedidos.length > 0;
    $('#lista-pedidos').innerHTML = pedidos.slice().reverse().map(p => `
      <article class="pedido">
        <header>
          <span class="folio">${p.folio}</span>
          <span class="estado">Recibido</span>
        </header>
        <div>${escapar(p.nombre)} · Grupo ${escapar(p.grupo)} · Entrega ${p.hora}</div>
        <ul>${p.items.map(i => `<li>${i.cantidad} × ${i.nombre}</li>`).join('')}</ul>
        ${p.comentarios ? `<div class="item-sub">Nota: ${escapar(p.comentarios)}</div>` : ''}
        <strong>Total: ${Carrito.formatoMoneda(p.total)}</strong>
        <div class="item-sub">${new Date(p.fecha).toLocaleString('es-MX')}</div>
      </article>`).join('');
  }

  function escapar(t) {
    return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function aviso(msg) {
    const el = $('#aviso');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => (el.hidden = true), 2200);
  }

  // ---------- Eventos ----------
  $('#categorias').addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    categoriaActiva = btn.dataset.cat;
    pintarCategorias();
    pintarProductos();
  });

  $('#buscar').addEventListener('input', pintarProductos);

  $('#lista-productos').addEventListener('click', e => {
    const btn = e.target.closest('.btn-agregar');
    if (!btn) return;
    const producto = menu.find(p => p.id === Number(btn.dataset.id));
    try {
      carrito = Carrito.agregar(carrito, producto);
      pintarCarrito();
      aviso(`${producto.nombre} agregado`);
    } catch (err) {
      aviso(err.message);
    }
  });

  $('#items-carrito').addEventListener('click', e => {
    const btn = e.target.closest('button[data-accion]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    carrito = Carrito.cambiarCantidad(carrito, id, btn.dataset.accion === 'mas' ? 1 : -1);
    pintarCarrito();
  });

  $('#form-pedido').addEventListener('submit', e => {
    e.preventDefault();
    const datos = {
      nombre: $('#nombre').value,
      grupo: $('#grupo').value.toUpperCase(),
      hora: $('#hora').value,
      comentarios: $('#comentarios').value.trim()
    };
    const errores = Carrito.validarPedido(datos, carrito);
    $('#errores').innerHTML = errores.map(x => `<li>${x}</li>`).join('');
    if (errores.length) return;

    const pedido = {
      folio: Carrito.generarFolio(),
      ...datos,
      nombre: datos.nombre.trim(),
      items: carrito,
      total: Carrito.subtotal(carrito),
      fecha: new Date().toISOString()
    };
    const pedidos = leer(CLAVE_PEDIDOS, []);
    pedidos.push(pedido);
    guardar(CLAVE_PEDIDOS, pedidos);

    carrito = [];
    pintarCarrito();
    pintarPedidos();
    e.target.reset();
    $('#folio').textContent = pedido.folio;
    $('#dialogo-confirmacion').showModal();
  });

  $('#form-pedido').addEventListener('input', () => { $('#errores').innerHTML = ''; });

  $('#cerrar-dialogo').addEventListener('click', () => $('#dialogo-confirmacion').close());

  $('#btn-borrar-historial').addEventListener('click', () => {
    guardar(CLAVE_PEDIDOS, []);
    pintarPedidos();
    aviso('Historial borrado');
  });

  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('activo', t === tab));
    $('#vista-menu').hidden = tab.dataset.vista !== 'menu';
    $('#vista-pedidos').hidden = tab.dataset.vista !== 'pedidos';
  }));

  // ---------- Estado de red ----------
  function actualizarRed() { $('#estado-red').hidden = navigator.onLine; }
  window.addEventListener('online', actualizarRed);
  window.addEventListener('offline', actualizarRed);

  // ---------- PWA: Service Worker e instalación ----------
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registrado. Alcance:', reg.scope))
      .catch(err => console.error('Error al registrar el Service Worker:', err));
  }

  let eventoInstalar = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    eventoInstalar = e;
    $('#btn-instalar').hidden = false;
  });
  $('#btn-instalar').addEventListener('click', async () => {
    if (!eventoInstalar) return;
    eventoInstalar.prompt();
    await eventoInstalar.userChoice;
    eventoInstalar = null;
    $('#btn-instalar').hidden = true;
  });

  // ---------- Inicio ----------
  actualizarRed();
  cargarMenu();
  pintarCarrito();
  pintarPedidos();
})();
