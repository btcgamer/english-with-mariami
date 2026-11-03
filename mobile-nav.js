/* English with Mariami — mobile app navigation */
(function(){
  function mount(){
    if(document.querySelector('.mobile-bottom-nav')) return;
    const nav=document.createElement('nav');
    nav.className='mobile-bottom-nav';
    nav.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';
    nav.setAttribute('aria-label','მობილური ნავიგაცია');
    nav.innerHTML=`
      <a href="index.html"><span class="nav-icon">🏠</span><span>მთავარი</span></a>
      <a href="academy.html"><span class="nav-icon">🎓</span><span>აკადემია</span></a>
      <a href="grade2.html"><span class="nav-icon">📚</span><span>სწავლა</span></a>`;
    document.body.appendChild(nav);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
