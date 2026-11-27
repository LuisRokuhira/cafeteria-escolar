/*
 * sw.js — Service Worker: guarda los archivos en caché para que
 * la aplicación funcione sin conexión.
 * Cambia VERSION cada vez que publiques cambios para forzar la actualización.
 */
const VERSION = 'cafeteria-v1.0.0';
const ARCHIVOS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/carrito.js',
  './js/datos-respaldo.js',
  './data/menu.json',
  './manifest.json',
  './img/icon-192.png',
  './img/icon-512.png'
];

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(VERSION).then(cache => cache.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys().then(claves =>
      Promise.all(claves.filter(c => c !== VERSION).map(c => caches.delete(c))))
  );
  self.clients.claim();
});

// Estrategia: red primero para el menú (datos frescos), caché primero para lo demás.
self.addEventListener('fetch', evento => {
  const url = new URL(evento.request.url);
  if (evento.request.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.endsWith('/data/menu.json')) {
    evento.respondWith(
      fetch(evento.request)
        .then(resp => {
          const copia = resp.clone();
          caches.open(VERSION).then(c => c.put(evento.request, copia));
          return resp;
        })
        .catch(() => caches.match(evento.request))
    );
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then(enCache => enCache || fetch(evento.request))
  );
});
