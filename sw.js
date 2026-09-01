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
  './app-icon.svg',
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

/* =========================
   INSTALL
========================= */

self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => {

        console.log(
          '[SW] Installing:',
          CACHE_NAME
        );

        return cache.addAll(APP_SHELL);
      })

      .then(() => {

        // ახალი Service Worker დაუყოვნებლივ გააქტიურდეს
        return self.skipWaiting();

      })

  );

});


/* =========================
   ACTIVATE
========================= */

self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys()

      .then(cacheNames => {

        return Promise.all(

          cacheNames

            .filter(cacheName => {

              return (
                cacheName.startsWith('english-with-mariami-') &&
                cacheName !== CACHE_NAME
              );

            })

            .map(cacheName => {

              console.log(
                '[SW] Removing old cache:',
                cacheName
              );

              return caches.delete(cacheName);

            })

        );

      })

      .then(() => {

        console.log(
          '[SW] Activated:',
          CACHE_NAME
        );

        return self.clients.claim();

      })

  );

});


/* =========================
   FETCH
========================= */

self.addEventListener('fetch', event => {

  const request = event.request;

  // მხოლოდ GET მოთხოვნები
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // სხვა დომენების მოთხოვნებს არ შევეხოთ
  if (url.origin !== self.location.origin) {
    return;
  }


  /*
    HTML გვერდები:
    Network First

    ინტერნეტი თუ არის → მიიღებს ახალ ვერსიას.
    ინტერნეტი თუ არ არის → cache გამოიყენება.
  */

  if (
    request.mode === 'navigate' ||
    request.destination === 'document'
  ) {

    event.respondWith(

      fetch(request)

        .then(response => {

          if (response && response.ok) {

            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, copy);
              });

          }

          return response;

        })

        .catch(() => {

          return caches.match(request)
            .then(cached => {

              return (
                cached ||
                caches.match('./index.html')
              );

            });

        })

    );

    return;
  }


  /*
    CSS / JS / Images / Fonts:
    Cache First + Network Update
  */

  event.respondWith(

    caches.match(request)

      .then(cachedResponse => {

        const networkFetch = fetch(request)

          .then(response => {

            if (
              response &&
              response.ok
            ) {

              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, copy);
                });

            }

            return response;

          })

          .catch(() => {

            return cachedResponse;

          });


        // თუ cache არსებობს, მაშინვე დავაბრუნოთ
        // წინააღმდეგ შემთხვევაში network
        return cachedResponse || networkFetch;

      })

  );

});


/* =========================
   MESSAGE
   აპიდან Service Worker-ის
   განახლების კონტროლი
========================= */

self.addEventListener('message', event => {

  if (!event.data) {
    return;
  }


  /* ახალი Service Worker-ის დაუყოვნებლივ გააქტიურება */

  if (event.data.type === 'SKIP_WAITING') {

    self.skipWaiting();

  }


  /* ყველა cache-ის გასუფთავება */

  if (event.data.type === 'CLEAR_CACHE') {

    event.waitUntil(

      caches.keys()

        .then(cacheNames => {

          return Promise.all(

            cacheNames.map(cacheName => {

              return caches.delete(cacheName);

            })

          );

        })

    );

  }

});


/* =========================
   PUSH NOTIFICATIONS
   მომავლისთვის მზადაა
========================= */

self.addEventListener('push', event => {

  let data = {
    title: 'English with Mariami',
    body: 'ახალი შეტყობინება 📚',
    icon: './app-icon.svg',
    badge: './app-icon.svg'
  };


  try {

    if (event.data) {

      data = {
        ...data,
        ...event.data.json()
      };

    }

  } catch (error) {

    console.log(
      '[SW] Push data error:',
      error
    );

  }


  event.waitUntil(

    self.registration.showNotification(
      data.title,
      {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [100, 50, 100],
        data: {
          url: './academy.html'
        }
      }
    )

  );

});


/* =========================
   NOTIFICATION CLICK
========================= */

self.addEventListener(
  'notificationclick',
  event => {

    event.notification.close();

    const targetUrl =
      event.notification?.data?.url ||
      './academy.html';


    event.waitUntil(

      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })

      .then(clientList => {

        for (const client of clientList) {

          if (
            'focus' in client &&
            client.url.includes(
              self.location.origin
            )
          ) {

            client.navigate(targetUrl);

            return client.focus();

          }

        }


        if (clients.openWindow) {

          return clients.openWindow(
            targetUrl
          );

        }

      })

    );

  }
);


/* =========================
   ERROR LOG
========================= */

self.addEventListener(
  'error',
  event => {

    console.error(
      '[SW] Error:',
      event.error
    );

  }
);


console.log(
  '%c English with Mariami Service Worker %c ' +
  'READY 🚀 ',
  'background:#075eff;color:white;padding:5px 10px;border-radius:5px;',
  'background:#ffe600;color:#020817;padding:5px 10px;border-radius:5px;'
);
