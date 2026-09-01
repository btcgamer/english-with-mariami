// English with Mariami — Advanced Service Worker
// PWA / Offline / Cache / Auto Update

'use strict';

const CACHE_NAME = 'english-with-mariami-v3';

const APP_SHELL = [
  './',
  './index.html',
  './academy.html',
  './grade2.html',
  './grade3.html',
  './grade4.html',
  './login.html',
  './register.html',
  './reset-password.html',
  './teacher-login.html',
  './teacher.html',
  './teacher-dashboard.html',
  './student-dashboard.html',
  './parent-space.html',
  './manifest.webmanifest',
  './app.css',
  './styles.css',
  './mobile-app.css',
  './universe-theme.css',
  './universe-theme.js',
  './universe-max.css',
  './universe-max.js',
  './grade2/index.html',
  './grade3/index.html',
  './grade4/index.html',
  './grade2/grade2.css',
  './grade2/grade2.js',
  './grade2/grade2-3d.css',
  './grade2/grade2-dashboard-bridge.js',
  './grade2/grade2-supabase-bridge.js',
  './grade3/grade3.css',
  './grade3/grade3.js',
  './grade4/grade4.css',
  './grade4/grade4.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('english-with-mariami-') && cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const networkFetch = fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});