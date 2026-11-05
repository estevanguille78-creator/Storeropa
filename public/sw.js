// Demo Store Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Nuevo Pedido Recibido', body: 'Ingresó un nuevo pedido en la Sala de Control' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=192&q=80',
      badge: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=64&q=80',
    })
  );
});

