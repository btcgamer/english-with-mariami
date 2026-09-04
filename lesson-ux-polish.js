/* English with Mariami — Lesson UX polish (visual/accessibility only) */
(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase();
  if(!(path.endsWith('/lesson.html')||path==='lesson.html')) return;
  if(document.querySelector('script[data-ewm-lesson-ux-polish]')) return;

  const style=document.createElement('style');
  style.textContent=`
    .ewm-lesson-focus{
      outline:2px solid rgba(0,234,255,.55);
      outline-offset:5px;
      box-shadow:0 0 0 1px rgba(139,92,255,.2),0 0 35px rgba(0,234,255,.14)!important;
    }
    .section[id]{scroll-margin-top:88px}
    .ewm-section-hint{
      margin:-10px 0 15px;
      color:#8faebb;
      font-size:12px;
      line-height:1.5;
    }
    .speak,.option,.complete,.btn{
      -webkit-tap-highlight-color:transparent;
    }
    .speak:focus-visible,.option:focus-visible,.complete:focus-visible,.btn:focus-visible{
      outline:2px solid #00eaff;
      outline-offset:3px;
      box-shadow:0 0 24px rgba(0,234,255,.24);
    }
    @media(max-width:700px){
      .wrap{width:min(100% - 18px,1180px)}
      main{padding-top:18px}
      .hero h1{font-size:clamp(30px,10vw,48px)}
      .meta span{font-size:12px;padding:8px 10px}
      .section h2{font-size:22px;line-height:1.2}
      .word-card{min-height:132px;padding:15px}
      .word{font-size:21px}
      .speak{width:42px;height:42px}
      .option{min-height:42px;padding:10px 13px}
      .complete{min-height:48px}
    }
    @media(prefers-reduced-motion:reduce){
      .ewm-lesson-focus{box-shadow:none!important}
    }
  `;
  document.head.appendChild(style);

  function enhance(){
    const sections=[...document.querySelectorAll('#lessonContent > .section')];
    sections.forEach((section,i)=>{
      if(!section.id) section.id=['words','grammar','listening','exercise','game','quiz','complete'][i]||('lesson-section-'+(i+1));
      if(!section.dataset.ewmUx){
        section.dataset.ewmUx='1';
        section.setAttribute('tabindex','-1');
      }
      const h=section.querySelector('h2');
      if(h && !section.querySelector('.ewm-section-hint')){
        const hint=document.createElement('div');
        hint.className='ewm-section-hint';
        hint.textContent=i===0?'ახალი სიტყვები — მოუსმინე, წაიკითხე და დაიმახსოვრე.'
          :i===1?'მთავარი წესი და მაგალითები — ივარჯიშე წინადადებებით.'
          :i===2?'მოუსმინე ტექსტს და გაიმეორე ხმამაღლა.'
          :i===3?'აირჩიე სწორი პასუხი და შეამოწმე საკუთარი თავი.'
          :i===4?'მინი-თამაში — სწრაფი პრაქტიკა ახალი მასალის გასამყარებლად.'
          :i===5?'Quiz — დააფიქსირე შენი საუკეთესო შედეგი.'
          :'დაასრულე გაკვეთილი, როცა ყველა ეტაპს გაივლი.';
        h.insertAdjacentElement('afterend',hint);
      }
    });
  }

  function focusSection(id){
    const el=document.getElementById(id);
    if(!el) return;
    el.classList.remove('ewm-lesson-focus');
    void el.offsetWidth;
    el.classList.add('ewm-lesson-focus');
    el.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    setTimeout(()=>el.classList.remove('ewm-lesson-focus'),1200);
  }

  function bind(){
    document.querySelectorAll('a[href*="#"]').forEach(a=>{
      if(a.dataset.ewmNav) return;
      const raw=a.getAttribute('href')||'';
      const hash=raw.split('#')[1];
      if(!hash) return;
      a.dataset.ewmNav='1';
      a.addEventListener('click',e=>{
        const target=document.getElementById(hash);
        if(!target) return;
        e.preventDefault();
        history.replaceState(null,'','#'+hash);
        focusSection(hash);
      });
    });
  }

  function boot(){enhance();bind();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  new MutationObserver(boot).observe(document.body,{childList:true,subtree:true});
})();
