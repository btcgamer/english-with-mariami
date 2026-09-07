/* English with Mariami — shared Grade 2/3/4 top navigation */
(function(){
  'use strict';
  const grade=Number(document.body.dataset.grade||0);
  if(![2,3,4].includes(grade)) return;
  const ACADEMY='../academy.html';
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

  function mount(){
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
    nav.querySelector('.logout-btn').addEventListener('click',function(){
      const ok=window.confirm('Log out of English with Mariami?');
      if(!ok) return;
      try{
        Object.keys(localStorage).forEach(function(k){if(/^supabase\.auth\.token$|^sb-.*-auth-token$/.test(k)) localStorage.removeItem(k);});
        sessionStorage.clear();
      }catch(e){}
      window.location.href='../login.html?reason=logout';
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
  const observer=new MutationObserver(function(){mount();});
  observer.observe(document.body,{childList:true});
  setTimeout(mount,250);
  setTimeout(mount,1000);
})();
