'use strict';

const CACHE_NAME = 'english-with-mariami-v29';
const FUTURE_THEME = './magic-ai-25c.css';
const FUTURE_CLASSROOM = './shared/future-neon-classroom.css?v=20260906';
const NAV_TIMEOUT_MS = 4500;
const ASSET_TIMEOUT_MS = 7000;

const APP_SHELL = [
  './', './index.html', './academy.html', './grades.html', './academy-enchanted.js?v=2', './shared/academy-redirect.js', './shared/academy-redirect.css', './shared/review-polish.css?v=1', './grade2.html', './grade3.html', './grade4.html',
  './grade2/index.html', './grade3/index.html', './grade4/index.html',
  './login.html', './register.html', './reset-password.html',
  './student-dashboard.html', './manifest.webmanifest',
  './app.css', './styles.css', './mobile-app.css', './pwa-mobile.css', './pwa.js', './universe-theme.css',
  './universe-theme.js', './universe-max.css', './universe-max.js', './app-icon.svg', FUTURE_THEME,
  './shared/magic-ai-25c-century.css', FUTURE_CLASSROOM, './shared/academy-grade.css?v=20260930-rqa1', './shared/academy-grade-nav.css?v=20260930-rqa1', './shared/offline-core-fallback.js',
  './grade2/grade2.css', './grade2/grade2.js', './grade2/grade2-3d.css',
  './grade2/grade2-dashboard-bridge.js', './grade2/grade2-supabase-bridge.js', './grade2/grade2-content-expansion.js',
  './grade2/grade2-mega-practice-v2.js', './grade2/future-visual-layer.css', './shared/grade23-final-e2e.js',
  './grade3/grade3.css', './grade3/grade3.js', './grade3/grade3-futuristic-content.js',
  './grade3/grade3-content-expansion.js', './grade3/grade3-ai-companion.js', './grade3/future-visual-layer.css', './shared/grade23-final-e2e.js',
  './grade4/grade4.css', './grade4/grade4-futuristic-content.js', './grade4/future-visual-layer.css',
  './grade4/grade4-runtime-hardening.js', './grade4/grade4-content-expansion.js', './grade4/grade4.js',
  './grade4/grade4-supabase-progress-bridge.js', './grade4/grade4-progression-controller.js', './grade4/grade4-remote-rewards.js',
  './shared/mega-vocabulary.js', './shared/vocabulary-boost-v1.js', './academy-nav.js', './shared/ai-magic-companion.js'
];

self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE_NAME).then(async cache => {
    await Promise.allSettled(APP_SHELL.map(url => cache.add(url)));
    return self.skipWaiting();
  })
));

self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(names => Promise.all(
    names.filter(n => n.startsWith('english-with-mariami-') && n !== CACHE_NAME).map(n => caches.delete(n))
  )).then(() => self.clients.claim())
));

function fetchWithTimeout(request, ms){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { cache: 'no-store', signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET') return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;
  if(request.mode==='navigate' && url.pathname.endsWith('/parent-space.html')){event.respondWith(Promise.resolve(Response.redirect(new URL('./academy.html',self.location.origin).href,302)));return;}
  if(url.pathname==='/config.js'||url.pathname.endsWith('/config.js')) return;

  /* Grade pages own their complete HTML/runtime and are never rewritten. */
  if(request.mode==='navigate' && /\/grade[234](?:\/|\.html$)/.test(url.pathname)) return;

  if(request.mode==='navigate'||request.destination==='document'){
    event.respondWith(
      fetchWithTimeout(request, NAV_TIMEOUT_MS)
        .catch(async()=>{
          const cached=await caches.match(request);
          return cached || caches.match('./index.html') || Response.error();
        })
    );
    return;
  }

  event.respondWith(
    fetchWithTimeout(request, ASSET_TIMEOUT_MS).catch(()=>
      caches.match(request).then(c=>c||caches.match(request,{ignoreSearch:true}))
    )
  );
});

self.addEventListener('message', event => {
  if(!event.data)return;
  if(event.data.type==='SKIP_WAITING') self.skipWaiting();
  if(event.data.type==='CLEAR_CACHE') event.waitUntil(caches.keys().then(names=>Promise.all(names.map(n=>caches.delete(n)))));
});

self.addEventListener('push', event => {
  let data={title:'English with Mariami',body:'ახალი შეტყობინება 📚',icon:'./app-icon.svg',badge:'./app-icon.svg'};
  try{if(event.data)data={...data,...event.data.json()}}catch(error){console.log('[SW] Push data error:',error)}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:data.icon,badge:data.badge,vibrate:[100,50,100],data:{url:'./academy.html'}}));
});

self.addEventListener('notificationclick',event => {
  event.notification.close();
  const targetUrl=event.notification?.data?.url||'./academy.html';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if('focus' in client&&client.url.includes(self.location.origin)){
        client.navigate(targetUrl);
        return client.focus();
      }
    }
    if(clients.openWindow)return clients.openWindow(targetUrl);
  }));
});

console.log('[SW] English with Mariami v26 READY — responsive QA refresh');
