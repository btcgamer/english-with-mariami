/* English with Mariami — Futuristic Learning Universe interaction layer */
(function(){'use strict';
const p=(location.pathname||'').toLowerCase();
const grade=p.includes('grade4')?'grade4':p.includes('grade3')?'grade3':p.includes('grade2')?'grade2':'home';
document.documentElement.dataset.universe=grade; document.body.classList.add('u-universe','u-'+grade);
const candidates='.lesson,.stat,.card,.grade-card,.grade,.portal,.feature-card,.mission-card,.mission,.info-card,.daily-card';
function decorate(root=document){root.querySelectorAll(candidates).forEach((el,i)=>{if(el.classList.contains('u-holo'))return;el.classList.add('u-holo');el.style.setProperty('--u-delay',`${(i%12)*55}ms`);});}
decorate(); new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)decorate(n)}))).observe(document.body,{childList:true,subtree:true});
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reduce.matches){document.addEventListener('pointermove',e=>{if(innerWidth<800)return;const t=e.target.closest?.('.u-holo');if(!t)return;const r=t.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform=`perspective(800px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-7px) scale(1.012)`;t.style.setProperty('--u-mx',`${(x+.5)*100}%`);t.style.setProperty('--u-my',`${(y+.5)*100}%`)},{passive:true});document.addEventListener('pointerout',e=>{const t=e.target.closest?.('.u-holo');if(t&&(!e.relatedTarget||!t.contains(e.relatedTarget))){t.style.transform='';t.style.removeProperty('--u-mx');t.style.removeProperty('--u-my')}},{passive:true});}
/* Shared Core: load the additive MAX layer without replacing page-specific styles. */
function loadOnce(kind,href){if(kind==='css'){if([...document.styleSheets].some(s=>s.href&&s.href.endsWith(href)))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l);return;}if(document.querySelector(`script[src$="${href}"]`))return;const s=document.createElement('script');s.src=href;s.defer=true;document.head.appendChild(s);}
loadOnce('css','/universe-max.css');
loadOnce('css','/shared/lesson-design.css');
loadOnce('js','/universe-max.js');

/* Root page only: make the PWA manifest discoverable and register the existing root service worker. */
if(grade==='home'){
  if(!document.querySelector('link[rel="manifest"]')){
    const manifest=document.createElement('link');
    manifest.rel='manifest';
    manifest.href='/manifest.webmanifest';
    document.head.appendChild(manifest);
  }
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(reg=>{if(reg.update)reg.update()}).catch(err=>console.warn('[PWA] Service Worker unavailable:',err));
    },{once:true});
  }
}

/* Main page only: expose the browser's real PWA install action as INSTALL APP. */
if(grade==='home' && !window.matchMedia('(display-mode: standalone)').matches && !window.navigator.standalone){
  let deferredPrompt=null;
  const addInstallButton=()=>{
    if(document.getElementById('__ewm-install-app'))return;
    const buttons=document.querySelector('.hero-buttons');
    if(!buttons)return;
    const btn=document.createElement('button');
    btn.id='__ewm-install-app';
    btn.type='button';
    btn.className='primary-button ewm-install-app';
    btn.textContent='📱 INSTALL APP';
    btn.style.cursor='pointer';
    btn.style.border='1px solid #a4ffff';
    btn.style.font='inherit';
    btn.hidden=true;
    btn.addEventListener('click',async()=>{
      if(!deferredPrompt)return;
      btn.disabled=true;
      try{
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      }catch(e){console.warn('PWA install prompt error:',e)}
      deferredPrompt=null;
      btn.hidden=true;
      btn.disabled=false;
    });
    buttons.appendChild(btn);
  };
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredPrompt=event;
    addInstallButton();
    const btn=document.getElementById('__ewm-install-app');
    if(btn)btn.hidden=false;
  });
  window.addEventListener('appinstalled',()=>{
    deferredPrompt=null;
    const btn=document.getElementById('__ewm-install-app');
    if(btn)btn.hidden=true;
  });
}
})();
