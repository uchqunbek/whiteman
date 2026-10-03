var CACHE_NAME = 'whiteman-v2';
var APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/i18n.js',
  './js/storage.js',
  './js/sounds.js',
  './js/game.js',
  './js/app.js',
  './js/pwa.js',
  './assets/confetti.js',
  './assets/icon.svg',
  './data/words.json',
  './audio/wrong.mp3',
  './audio/victory.mp3',
  './audio/evil-laugh.mp3'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return Promise.all(APP_FILES.map(function(path) {
          return cache.add(path).catch(function(error) {
            console.error('Could not cache ' + path + ':', error);
          });
        }));
      })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(caches.match(request).then(function(cachedPage) {
      if (cachedPage) return cachedPage;
      return caches.match('./index.html').then(function(cachedHome) {
        return cachedHome || fetch(request);
      });
    }));
    return;
  }

  event.respondWith(caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetch(request).then(function(response) {
      if (response.ok) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(request, copy); });
      }
      return response;
    });
  }));
});
