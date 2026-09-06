/* English with Mariami — shared AI Magic Companion + Grade Logout. */
(function(){
  'use strict';
  if(window.__AI_MAGIC_COMPANION__)return;
  window.__AI_MAGIC_COMPANION__=true;
  function loadCss(key,href){
    if(document.querySelector('link[data-ewm-'+key+']'))return;
    var l=document.createElement('link');
    l.rel='stylesheet'; l.href=href; l.setAttribute('data-ewm-'+key,'true');
    document.head.appendChild(l);
  }
  function loadJs(key,src){
    if(document.querySelector('script[data-ewm-'+key+']'))return;
    var s=document.createElement('script');
    s.src=src; s.defer=true; s.setAttribute('data-ewm-'+key,'true');
    document.head.appendChild(s);
  }
  function addLogout(){
    var path=location.pathname;
    var grade=path.includes('/grade2/')?'2':path.includes('/grade3/')?'3':path.includes('/grade4/')?'4':'';
    if(!grade)return;
    var id='ewmGradeLogout';
    var old=document.getElementById(id);
    if(old) return;
    var b=document.createElement('button');
    b.id=id; b.type='button'; b.textContent='↪ გამოსვლა';
    b.setAttribute('aria-label','Logout');
    b.title='Logout';
    b.style.cssText='position:fixed;top:14px;right:14px;z-index:2147483647;display:inline-flex;align-items:center;justify-content:center;gap:5px;height:32px;padding:0 10px;border:1px solid rgba(120,210,255,.38);border-radius:9px;background:rgba(5,12,28,.94);color:#dffaff;font:800 10px/1 Arial,sans-serif;letter-spacing:.04em;cursor:pointer;box-shadow:0 0 18px rgba(36,180,255,.12);backdrop-filter:blur(10px);';
    b.onmouseenter=function(){b.style.borderColor='rgba(120,230,255,.8)';b.style.boxShadow='0 0 24px rgba(36,200,255,.24)'};
    b.onmouseleave=function(){b.style.borderColor='rgba(120,210,255,.38)';b.style.boxShadow='0 0 18px rgba(36,180,255,.12)'};
    b.onclick=async function(){
      b.disabled=true; b.textContent='…';
      try{var db=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||window.supabase;if(db&&db.auth&&db.auth.signOut)await db.auth.signOut();}catch(e){console.warn('[Grade '+grade+' Logout]',e)}
      location.replace('../login.html');
    };
    document.body.appendChild(b);
  }
  var assets=[
    ['ai-magic-world-dimension-gate33','/shared/ai-magic-world-dimension-gate-33.css?v=20260906-dgate33','css'],
    ['ai-magic-world-quantum-navigator34','/shared/ai-magic-world-quantum-navigator-34.css?v=20260906-qnav34','css'],
    ['ai-magic-world-mission-hologram35','/shared/ai-magic-world-mission-hologram-35.css?v=20260906-mholo35','css'],
    ['ai-magic-world-neural-battlefield36','/shared/ai-magic-world-neural-battlefield-36.css?v=20260906-battle36','css'],
    ['ai-magic-world-neural-battle-arena37','/shared/ai-magic-world-neural-battle-arena-37.css?v=20260906-arena37','css'],
    ['ai-magic-world-neural-war-room38','/shared/ai-magic-world-neural-war-room-38.css?v=20260906-warroom38','css'],
    ['ai-magic-world-holographic-battle-command39','/shared/ai-magic-world-holographic-battle-command-39.css?v=20260906-hbc39','css'],
    ['ai-magic-world-omniverse-command-core40','/shared/ai-magic-world-omniverse-command-core-40.css?v=20260906-omni40','css'],
    ['ai-magic-world-dimension-gate33','/shared/ai-magic-world-dimension-gate-33.js?v=20260906-dgate33','js'],
    ['ai-magic-world-quantum-navigator34','/shared/ai-magic-world-quantum-navigator-34.js?v=20260906-qnav34','js'],
    ['ai-magic-world-mission-hologram35','/shared/ai-magic-world-mission-hologram-35.js?v=20260906-mholo35','js'],
    ['ai-magic-world-neural-battlefield36','/shared/ai-magic-world-neural-battlefield-36.js?v=20260906-battle36','js'],
    ['ai-magic-world-neural-battle-arena37','/shared/ai-magic-world-neural-battle-arena-37.js?v=20260906-arena37','js'],
    ['ai-magic-world-neural-war-room38','/shared/ai-magic-world-neural-war-room-38.js?v=20260906-warroom38','js'],
    ['ai-magic-world-holographic-battle-command39','/shared/ai-magic-world-holographic-battle-command-39.js?v=20260906-hbc39','js'],
    ['ai-magic-world-omniverse-command-core40','/shared/ai-magic-world-omniverse-command-core-40.js?v=20260906-omni40','js']
  ];
  assets.forEach(function(a){a[2]==='css'?loadCss(a[0],a[1]):loadJs(a[0],a[1]);});
  function boot(){addLogout();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
