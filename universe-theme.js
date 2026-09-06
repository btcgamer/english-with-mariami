/* English with Mariami — Futuristic Learning Universe interaction layer */
(function(){
  'use strict';

  const p=(location.pathname||'').toLowerCase();
  const grade=p.includes('grade4')?'grade4':p.includes('grade3')?'grade3':p.includes('grade2')?'grade2':'home';

  document.documentElement.dataset.universe=grade;
  document.body.classList.add('u-universe','u-'+grade);

  /* Shared Future Neon Classroom visual system. */
  (function loadFutureVisual(){
    const href='/shared/future-neon-classroom.css?v=20260906';
    if(document.querySelector('link[data-ewm-future-neon]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.dataset.ewmFutureNeon='1';
    document.head.appendChild(link);
  })();

  const candidates='.lesson,.stat,.card,.grade-card,.grade,.portal,.feature-card,.mission-card,.mission,.info-card,.daily-card';

  function decorate(root=document){
    root.querySelectorAll(candidates).forEach((el,i)=>{
      if(el.classList.contains('u-holo')) return;
      el.classList.add('u-holo');
      el.style.setProperty('--u-delay',`${(i%12)*55}ms`);
    });
  }

  decorate();

  new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{
    if(n.nodeType===1)decorate(n);
  }))).observe(document.body,{childList:true,subtree:true});

  /* Grade 2/3/4 sidebar inspired by the supplied dashboard visual. */
  if(['grade2','grade3','grade4'].includes(grade)){
    const buildSidebar=()=>{
      if(document.querySelector('.fn-sidebar')) return;

      const sidebar=document.createElement('aside');
      sidebar.className='fn-sidebar';
      sidebar.setAttribute('aria-label','Learning navigation');

      const current=grade.replace('grade','');

      const items=[
        ['🏠','DASHBOARD','/academy.html','home'],
        ['🌱','GRADE '+current,'#','grade'],
        ['🧠','FLASHCARDS','#flashcards','flash'],
        ['🎯','QUIZ','#quiz','quiz'],
        ['🧩','WORD MATCH','#word-match','match'],
        ['✍️','SENTENCE BUILDER','#sentence-builder','sentence'],
        ['🏆','FINAL REVIEW','#final-review','review'],
        ['🏅','ACHIEVEMENTS','#achievements','achievements']
      ];

      sidebar.innerHTML=`
        <div class="fn-sidebar-title">
          <b>MAGIC AI</b><br>
          LEARNING CONTROL
        </div>
        <nav class="fn-side-list">
          ${items.map(item=>`<a class="fn-side-link ${item[3]==='grade'?'active':''}" href="${item[2]}" data-fn-target="${item[3]}"><span class="fn-side-icon">${item[0]}</span><span>${item[1]}</span></a>`).join('')}
        </nav>
        <div class="fn-side-spacer"></div>
        <div class="fn-side-home">60 MISSIONS • FUTURE CORE</div>
      `;

      document.body.appendChild(sidebar);

      sidebar.addEventListener('click',event=>{
        const link=event.target.closest('.fn-side-link');
        if(!link) return;
        const target=link.dataset.fnTarget;
        if(target==='home'||target==='grade') return;
        const candidates={
          flash:['#flashcards','.flashcards','#flashcard'],
          quiz:['#quiz','.quiz','#quizSection'],
          match:['#word-match','.word-match','#wordMatch'],
          sentence:['#sentence-builder','.sentence-builder','#sentenceBuilder'],
          review:['#final-review','.final-review','#finalReview'],
          achievements:['#achievements','.achievements','#achievement']
        }[target]||[];
        const el=candidates.map(sel=>document.querySelector(sel)).find(Boolean);
        if(el){
          event.preventDefault();
          el.scrollIntoView({behavior:'smooth',block:'start'});
        }
      });
    };

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',buildSidebar,{once:true});
    else buildSidebar();
  }

  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  if(!reduce.matches){
    document.addEventListener('pointermove',e=>{
      if(innerWidth<800)return;
      const t=e.target.closest?.('.u-holo');
      if(!t)return;
      const r=t.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      t.style.transform=`perspective(800px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-7px) scale(1.012)`;
      t.style.setProperty('--u-mx',`${(x+.5)*100}%`);
      t.style.setProperty('--u-my',`${(y+.5)*100}%`);
    },{passive:true});

    document.addEventListener('pointerout',e=>{
      const t=e.target.closest?.('.u-holo');
      if(t&&(!e.relatedTarget||!t.contains(e.relatedTarget))){
        t.style.transform='';
        t.style.removeProperty('--u-mx');
        t.style.removeProperty('--u-my');
      }
    },{passive:true});
  }

  /* Shared Core: load additive MAX layer without replacing page-specific styles. */
  function loadOnce(kind,href){
    if(kind==='css'){
      if([...document.styleSheets].some(s=>s.href&&s.href.endsWith(href)))return;
      const l=document.createElement('link');
      l.rel='stylesheet';
      l.href=href;
      document.head.appendChild(l);
      return;
    }
    if(document.querySelector(`script[src$="${href}"]`))return;
    const s=document.createElement('script');
    s.src=href;
    s.defer=true;
    document.head.appendChild(s);
  }

  loadOnce('css','/universe-max.css');
  loadOnce('css','/shared/lesson-design.css');
  loadOnce('js','/universe-max.js');

  /* Root page: manifest + existing service worker. */
  if(grade==='home'){
    if(!document.querySelector('link[rel="manifest"]')){
      const manifest=document.createElement('link');
      manifest.rel='manifest';
      manifest.href='/manifest.webmanifest';
      document.head.appendChild(manifest);
    }

    if('serviceWorker' in navigator){
      window.addEventListener('load',()=>{
        navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(reg=>{
          if(reg.update)reg.update();
        }).catch(err=>console.warn('[PWA] Service Worker unavailable:',err));
      },{once:true});
    }
  }

  /* Main page PWA install action. */
  if(grade==='home'&&!window.matchMedia('(display-mode: standalone)').matches&&!window.navigator.standalone){
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
        }catch(e){
          console.warn('PWA install prompt error:',e);
        }
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