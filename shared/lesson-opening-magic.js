/* MAGIC NEON AI ACADEMY — Cinematic Lesson Opening */
(function(){'use strict';
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modalSelectors=['#modal','.g3-vocab-modal','.g4-vocab-modal'];
  const isLessonModal=el=>el&&modalSelectors.some(s=>el.matches?.(s));
  const seen=new WeakSet();
  function getLabel(modal){
    const title=modal.querySelector('h1,h2,h3,.modal-title,.g3-vocab-title,.g4-vocab-title,.lesson-title');
    return (title?.textContent||'MISSION').trim().replace(/\s+/g,' ').slice(0,70);
  }
  function openMagic(modal){
    if(seen.has(modal)||!isLessonModal(modal)||modal.dataset.magicOpening==='active')return;
    const visible=getComputedStyle(modal).display!=='none' && getComputedStyle(modal).visibility!=='hidden';
    if(!visible)return;
    seen.add(modal); modal.dataset.magicOpening='active';
    const portal=document.createElement('div'); portal.className='lesson-magic-opening'; portal.innerHTML=`<div class="lmo-grid"></div><div class="lmo-orbit lmo-orbit-a"></div><div class="lmo-orbit lmo-orbit-b"></div><div class="lmo-core"><div class="lmo-kicker">MAGIC PORTAL</div><div class="lmo-title">MISSION CORE</div><div class="lmo-label"></div><div class="lmo-status">LESSON ACTIVATED</div></div><div class="lmo-particles"></div>`;
    portal.querySelector('.lmo-label').textContent=getLabel(modal);
    portal.setAttribute('aria-hidden','true'); modal.appendChild(portal);
    const done=()=>{portal.classList.add('is-complete');setTimeout(()=>{portal.remove();delete modal.dataset.magicOpening},reduce?80:1050)};
    requestAnimationFrame(()=>{portal.classList.add('is-live'); if(reduce)setTimeout(done,80); else setTimeout(done,1750)});
  }
  function scan(){modalSelectors.forEach(sel=>document.querySelectorAll(sel).forEach(openMagic));}
  scan(); new MutationObserver(scan).observe(document.body,{attributes:true,attributeFilter:['class','style','aria-hidden'],childList:true,subtree:true});
})();
