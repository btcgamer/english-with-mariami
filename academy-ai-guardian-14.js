/* English with Mariami — AI Guardian Memory / World Awareness 14.0
 * Visual-only Academy layer. Reads existing local UI state only.
 * No auth, Supabase, XP, stars, progress, lessons, or navigation writes.
 */
(function(){
  'use strict';
  if(window.__EWM_AI_GUARDIAN_14__) return;
  window.__EWM_AI_GUARDIAN_14__=true;

  const worlds={
    '2':['CYBER COVE','NEON FOREST','SKY LAB','ROBOT CITY','MAGIC OCEAN'],
    '3':['AURORA','CRYSTAL','NEBULA','FOREST','OCEAN','DESERT','ICE','VOLCANO','MOON','TEMPLE','QUANTUM','CORE'],
    '4':['WONDERLAND','GUARDIAN','FINAL CROWN']
  };
  function grade(){
    const p=location.pathname.toLowerCase();
    if(/grade4|g4/.test(p)) return '4';
    if(/grade3|g3/.test(p)) return '3';
    return '2';
  }
  function currentWorld(){
    const g=grade(), names=worlds[g]||[];
    const active=document.querySelector('.world-card.active,[data-world].active,.active-world');
    if(active){
      const raw=(active.dataset.world||active.dataset.zone||active.textContent||'').trim().toUpperCase();
      const found=names.findIndex(n=>raw.includes(n));
      if(found>=0) return names[found];
    }
    return names[0]||'ACADEMY';
  }
  function guardian(){return document.querySelector('.ewm-guardian7');}
  function state(kind){
    const g=guardian(); if(!g) return;
    g.dataset.guardianMemory=kind;
    g.classList.remove('g14-remember','g14-world','g14-alert');
    g.classList.add('g14-'+kind);
    clearTimeout(g.__g14Timer);
    g.__g14Timer=setTimeout(()=>g.classList.remove('g14-'+kind),1400);
  }
  function label(){
    let el=document.getElementById('ewm-g14-memory');
    if(el) return el;
    el=document.createElement('div'); el.id='ewm-g14-memory'; el.setAttribute('aria-hidden','true');
    document.body.appendChild(el); return el;
  }
  function announce(kind){
    const el=label(), name=currentWorld();
    el.textContent=kind==='world' ? 'WORLD MEMORY • '+name : kind==='alert' ? 'GUARDIAN MEMORY • SYNCED' : 'AI MEMORY • ONLINE';
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(el.__timer); el.__timer=setTimeout(()=>el.classList.remove('show'),1800);
  }
  function boot(){
    const g=guardian(); if(!g) return false;
    document.documentElement.dataset.aiGuardian14='memory';
    const style=document.createElement('style');
    style.textContent=`
      #ewm-g14-memory{position:fixed;left:50%;bottom:24px;transform:translate(-50%,18px);z-index:99997;pointer-events:none;opacity:0;padding:9px 16px;border:1px solid rgba(87,236,255,.5);border-radius:999px;background:rgba(4,8,24,.72);backdrop-filter:blur(12px);box-shadow:0 0 24px rgba(71,217,255,.28);color:#dffcff;font:700 11px/1.2 system-ui,sans-serif;letter-spacing:.16em;transition:opacity .28s,transform .28s}
      #ewm-g14-memory.show{opacity:1;transform:translate(-50%,0)}
      .ewm-guardian7.g14-world{filter:brightness(1.55) saturate(1.35)}
      .ewm-guardian7.g14-world .g7-core{transform:scale(1.16)}
      .ewm-guardian7.g14-remember .g7-eye{filter:brightness(2.3);transform:scale(1.16)}
      .ewm-guardian7.g14-alert{filter:brightness(1.8) saturate(1.45)}
      .ewm-guardian7.g14-alert .g7-ring{filter:brightness(2.3)}
      @media (prefers-reduced-motion:reduce){#ewm-g14-memory{transition:none}.ewm-guardian7.g14-world .g7-core,.ewm-guardian7.g14-remember .g7-eye{transform:none}}
      @media (max-width:600px){#ewm-g14-memory{bottom:12px;max-width:calc(100vw - 24px);font-size:9px}}
    `;
    document.head.appendChild(style);
    label();
    announce('remember');
    document.addEventListener('click',e=>{
      if(e.target.closest('.ap4-portal,.ap4-enter,.ap4-launch')){state('world');announce('world');}
      else if(e.target.closest('.g7-body,.g7-core')){state('remember');announce('remember');}
    },{passive:true});
    window.addEventListener('ewm:portal-activated',()=>{state('world');announce('world')});
    window.addEventListener('ewm:mission-activated',()=>{state('remember');announce('remember')});
    window.addEventListener('ewm:mission-complete',()=>{state('alert');announce('alert')});
    window.addEventListener('storage',()=>{if(guardian()){state('remember');announce('remember')}});
    return true;
  }
  if(!boot()){
    const mo=new MutationObserver(()=>{if(boot()) mo.disconnect()});
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),10000);
  }
})();
