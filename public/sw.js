const CACHE_NAME = 'urdinart-player-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// URLs que NO deben ser cacheadas
const noCacheUrls = [
  '/songs.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch(err => {
        console.error('Cache addAll failed:', err);
      })
  );
});

self.addEventListener('fetch', event => {
  // Estrategia de caché para archivos de audio (MP3)
  if (event.request.url.includes('/audio/') && event.request.url.endsWith('.mp3')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // No cachear solicitudes a URLs específicas (como songs.json)
  if (noCacheUrls.some(url => event.request.url.includes(url))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Manejar solo solicitudes GET para otros recursos
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const networked = fetch(event.request)
          .then(fetched => {
            // Actualizar cache solo para recursos estáticos que no sean de noCacheUrls
            if (!noCacheUrls.some(url => event.request.url.includes(url))) {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, fetched.clone()))
                .catch(() => {});
            }
            return fetched;
          })
          .catch(() => cached); // Fallback a cache si la red falla
        
        return cached || networked;
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});
