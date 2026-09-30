/* English with Mariami — shared Grade 1–12 top navigation */
(function(){
  'use strict';
  const grade=Number(document.body.dataset.grade||0);
  if(grade<1||grade>12) return;
  /* Cache-bust Academy so an older cached auth/config page cannot send an
     already-authenticated student back to login after Grade → Academy. */
  const ACADEMY=`../academy.html?ewm_auth_refresh=20260907`;
  const STATE_KEY=`magic-neon-grade-${grade}`;

  function resetTransientMission(){
    try{
      const saved=JSON.parse(localStorage.getItem(STATE_KEY)||'null');
      if(saved&&typeof saved==='object'){
        saved.current=1;
        localStorage.setItem(STATE_KEY,JSON.stringify(saved));
      }
      sessionStorage.setItem(`magic-neon-fresh-grade-${grade}`,'1');
    }catch(e){}
  }


  function hideAudioTest(){
    const nodes=document.querySelectorAll('button,a,[role="button"],section,article,div');
    nodes.forEach(function(el){
      if(el.dataset.ewmAudioTestHidden==='1') return;
      const text=String(el.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase();
      if(text==='audio test'||text==='🎧 audio test'||text==='audio test / test'){
        el.dataset.ewmAudioTestHidden='1';
        el.style.display='none';
        el.setAttribute('aria-hidden','true');
      }
    });
  }
  function mount(){
    hideAudioTest();
    if(document.querySelector('.grade-top-nav')) return;
    const nav=document.createElement('nav');
    nav.className='grade-top-nav';
    nav.setAttribute('aria-label','Grade navigation');
    nav.innerHTML=`<a class="grade-nav-btn academy-btn" href="${ACADEMY}" aria-label="Back to Academy">← Academy</a><div class="grade-nav-spacer"></div><button class="grade-nav-btn logout-btn" type="button" aria-label="Log out">↪ Log out</button>`;
    document.body.appendChild(nav);
    nav.querySelector('.academy-btn').addEventListener('click',function(event){
      event.preventDefault();
      resetTransientMission();
      window.location.assign(new URL(ACADEMY,window.location.href).href);
    });
    nav.querySelector('.logout-btn').addEventListener('click',async function(){
      const ok=window.confirm('Log out of English with Mariami?');
      if(!ok) return;
      const btn=this;
      btn.disabled=true;
      btn.textContent='⏳ Logging out...';
      try{
        const db=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null;
        if(db&&db.auth&&typeof db.auth.signOut==='function'){
          const result=await db.auth.signOut();
          if(result&&result.error) console.warn('[Grade Nav] signOut warning:',result.error);
        }
        Object.keys(localStorage).forEach(function(k){if(/^supabase\.auth\.token$|^sb-.*-auth-token$/.test(k)) localStorage.removeItem(k);});
        sessionStorage.clear();
      }catch(e){console.warn('[Grade Nav] logout cleanup warning:',e);}
      window.location.href='../login.html?reason=logout';
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
  const observer=new MutationObserver(function(){mount();hideAudioTest();});
  observer.observe(document.body,{childList:true});
  setTimeout(mount,250);
  setTimeout(mount,1000);
  setTimeout(hideAudioTest,1500);
})();
