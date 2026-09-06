/* English with Mariami — shared Grade 2/3/4 top navigation */
(function(){
  'use strict';
  const grade=Number(document.body.dataset.grade||0);
  if(![2,3,4].includes(grade)) return;

  function mount(){
    if(document.querySelector('.grade-top-nav')) return;
    const nav=document.createElement('nav');
    nav.className='grade-top-nav';
    nav.setAttribute('aria-label','Grade navigation');
    nav.innerHTML=`
      <a class="grade-nav-btn academy-btn" href="../academy.html" aria-label="Back to Academy">← Academy</a>
      <div class="grade-nav-spacer"></div>
      <button class="grade-nav-btn logout-btn" type="button" aria-label="Log out">↪ Log out</button>`;
    document.body.appendChild(nav);

    nav.querySelector('.logout-btn').addEventListener('click',function(){
      const ok=window.confirm('Log out of English with Mariami?');
      if(!ok) return;
      try{
        Object.keys(localStorage).forEach(function(k){
          if(/^supabase\.auth\.token$|^sb-.*-auth-token$/.test(k)) localStorage.removeItem(k);
        });
        sessionStorage.clear();
      }catch(e){}
      window.location.href='../login.html?reason=logout';
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount);
  else mount();
  setTimeout(mount,250);
  setTimeout(mount,1000);
})();
