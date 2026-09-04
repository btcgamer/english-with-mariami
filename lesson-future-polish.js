/* English with Mariami — MAGIC NEON lesson flow polish
   Visual-only. No Auth, Supabase, XP, progress or lesson data writes. */
(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase();
  if(!(path.endsWith('/lesson.html')||path==='lesson.html')) return;
  if(document.querySelector('style[data-ewm-lesson-future-polish]')) return;

  const style=document.createElement('style');
  style.dataset.ewmLessonFuturePolish='1';
  style.textContent=`
    :root{--fm-cyan:#00eaff;--fm-purple:#8b5cff;--fm-pink:#ff39d4;--fm-green:#39ffa3;--fm-yellow:#ffe65c}
    #lessonContent{position:relative}
    #lessonContent:before{content:"";position:absolute;inset:0 -20vw;z-index:-1;pointer-events:none;background:radial-gradient(circle at 12% 28%,rgba(0,234,255,.08),transparent 24%),radial-gradient(circle at 88% 62%,rgba(139,92,255,.08),transparent 25%)}
    .hero{isolation:isolate}
    .hero:after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(115deg,transparent 15%,rgba(0,234,255,.06) 48%,transparent 70%);transform:translateX(-110%);animation:fmHeroSweep 7s ease-in-out infinite}
    @keyframes fmHeroSweep{0%,45%{transform:translateX(-110%)}70%,100%{transform:translateX(110%)}}
    .fm-flow{position:sticky;top:66px;z-index:80;margin:14px 0;padding:8px;display:flex;gap:7px;overflow-x:auto;border:1px solid rgba(0,234,255,.15);border-radius:16px;background:rgba(2,8,22,.72);backdrop-filter:blur(16px);box-shadow:0 12px 35px rgba(0,0,0,.25);scrollbar-width:none}
    .fm-flow::-webkit-scrollbar{display:none}
    .fm-step{flex:0 0 auto;border:1px solid rgba(255,255,255,.09);border-radius:999px;padding:8px 11px;background:rgba(255,255,255,.025);color:#8faab8;font-size:11px;font-weight:1000;letter-spacing:.2px;cursor:pointer;transition:.22s}
    .fm-step:hover,.fm-step:focus-visible{color:#eaffff;border-color:rgba(0,234,255,.42);box-shadow:0 0 18px rgba(0,234,255,.12);outline:none}
    .fm-step.is-active{color:#001116;border-color:var(--fm-cyan);background:linear-gradient(90deg,var(--fm-cyan),#72f5ff);box-shadow:0 0 22px rgba(0,234,255,.24)}
    .fm-section{position:relative;scroll-margin-top:132px}
    .fm-section.is-active{border-color:rgba(0,234,255,.34);box-shadow:0 22px 60px rgba(0,0,0,.34),0 0 28px rgba(0,234,255,.07),inset 0 1px rgba(255,255,255,.05)}
    .fm-section[data-stage] h2:after{content:attr(data-stage);display:inline-flex;margin-left:9px;vertical-align:middle;padding:4px 7px;border-radius:999px;border:1px solid rgba(0,234,255,.22);background:rgba(0,234,255,.05);color:#7fefff;font-size:9px;font-weight:1000;letter-spacing:.7px}
    .fm-section .btn,.fm-section .complete,.fm-section .option{transition:transform .2s,box-shadow .2s,border-color .2s}
    .fm-section .btn:hover,.fm-section .complete:hover,.fm-section .option:hover{transform:translateY(-2px)}
    .fm-section .speak{box-shadow:0 0 0 rgba(0,234,255,0);transition:.2s}
    .fm-section .speak:hover,.fm-section .speak:focus-visible{box-shadow:0 0 22px rgba(0,234,255,.24);outline:none}
    .fm-complete-glow{animation:fmCompleteGlow 2.8s ease-in-out infinite}
    @keyframes fmCompleteGlow{0%,100%{box-shadow:0 0 18px rgba(0,234,255,.16)}50%{box-shadow:0 0 38px rgba(139,92,255,.28),0 0 65px rgba(0,234,255,.12)}}
    @media(max-width:700px){.fm-flow{top:116px;margin-left:-2px;margin-right:-2px}.fm-step{padding:8px 10px}.fm-section{scroll-margin-top:178px}}
    @media(prefers-reduced-motion:reduce){.hero:after,.fm-complete-glow{animation:none!important}.fm-flow{scroll-behavior:auto}}
  `;
  document.head.appendChild(style);

  function setup(){
    const root=document.getElementById('lessonContent');
    if(!root || root.dataset.fmPolished==='1') return;
    const sections=[...root.querySelectorAll(':scope > section.section')];
    if(!sections.length) return;

    const labels=['🔤 სიტყვები','📖 გრამატიკა','🎧 მოსმენა','✏️ სავარჯიშო','🎮 თამაში','🧠 Quiz','🏆 დასრულება'];
    const steps=[];
    const flow=document.createElement('nav');
    flow.className='fm-flow';
    flow.setAttribute('aria-label','Lesson flow');
    sections.forEach((section,i)=>{
      section.classList.add('fm-section');
      section.dataset.stage=`STEP ${i+1}`;
      const button=document.createElement('button');
      button.type='button';
      button.className='fm-step';
      button.textContent=labels[i] || `STEP ${i+1}`;
      button.addEventListener('click',()=>section.scrollIntoView({behavior:'smooth',block:'start'}));
      flow.appendChild(button); steps.push(button);
    });
    root.insertBefore(flow,sections[0]);

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const index=sections.indexOf(entry.target);
          sections.forEach(s=>s.classList.remove('is-active'));
          steps.forEach(s=>s.classList.remove('is-active'));
          if(index>=0){sections[index].classList.add('is-active');steps[index].classList.add('is-active');steps[index].scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});}
        }
      });
    },{rootMargin:'-24% 0px -58% 0px',threshold:0});
    sections.forEach(s=>observer.observe(s));

    const complete=root.querySelector('.complete');
    if(complete) complete.classList.add('fm-complete-glow');
    root.dataset.fmPolished='1';
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
  const wait=new MutationObserver(setup);
  wait.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>wait.disconnect(),15000);
})();
