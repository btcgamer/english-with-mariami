// English with Mariami — Advanced Service Worker
// PWA / Offline / Cache / Auto Update

'use strict';

const CACHE_NAME = 'english-with-mariami-v11';

const APP_SHELL = [
  './', './index.html', './academy.html', './grade2.html', './grade3.html', './grade4.html',
  './login.html', './register.html', './reset-password.html', './teacher-login.html', './teacher.html',
  './teacher-dashboard.html', './student-dashboard.html', './parent-space.html', './manifest.webmanifest',
  './app.css', './styles.css', './mobile-app.css', './pwa-mobile.css', './pwa.js', './universe-theme.css',
  './universe-theme.js', './universe-max.css', './universe-max.js', './app-icon.svg',
  './grade2/index.html', './grade2/grade2.css', './grade2/grade2.js', './grade2/grade2-3d.css',
  './grade2/grade2-dashboard-bridge.js', './grade2/grade2-supabase-bridge.js', './grade2/grade2-content-expansion.js',
  './grade2/grade2-mega-practice-v2.js', './grade2/future-visual-layer.css',
  './grade3/index.html', './grade3/grade3.css', './grade3/grade3.js', './grade3/grade3-futuristic-content.js',
  './grade3/grade3-content-expansion.js', './grade3/grade3-ai-companion.js', './grade3/future-visual-layer.css',
  './grade4/index.html', './grade4/grade4.css', './grade4/grade4.js', './grade4/grade4-futuristic-content.js',
  './grade4/grade4-content-expansion.js', './grade4/future-visual-layer.css', './shared/mega-vocabulary.js',
  './academy-nav.js', './shared/ai-magic-companion.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] Installing:', CACHE_NAME);
      await Promise.allSettled(APP_SHELL.map(url => cache.add(url)));
      return self.skipWaiting();
    })
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

  // Never cache the Supabase browser configuration. A stale cached config can
  // point the login page at an old/deleted project hostname.
  if (url.pathname === '/config.js' || url.pathname.endsWith('/config.js')) return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response?.ok) {
            const cacheResponse = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, cacheResponse))
                .catch(error => console.warn('[SW] Document cache update skipped:', error))
            );
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response?.ok) {
          const cacheResponse = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, cacheResponse))
              .catch(error => console.warn('[SW] Asset cache update skipped:', error))
          );
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match(request, {ignoreSearch:true})))
  );
});

self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(caches.keys().then(names => Promise.all(names.map(name => caches.delete(name)))));
  }
});

self.addEventListener('push', event => {
  let data = {title:'English with Mariami',body:'ახალი შეტყობინება 📚',icon:'./app-icon.svg',badge:'./app-icon.svg'};
  try { if(event.data) data={...data,...event.data.json()}; } catch(error) { console.log('[SW] Push data error:',error); }
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:data.icon,badge:data.badge,vibrate:[100,50,100],data:{url:'./academy.html'}}));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl=event.notification?.data?.url||'./academy.html';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if('focus' in client && client.url.includes(self.location.origin)){
        client.navigate(targetUrl); return client.focus();
      }
    }
    if(clients.openWindow)return clients.openWindow(targetUrl);
  }));
});

console.log('[SW] English with Mariami v11 READY 🚀');