(() => {
  'use strict';
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let active = null, frame = 0;
  const reset = () => { cancelAnimationFrame(frame); frame = 0; if(active){active.style.removeProperty('--card-x');active.style.removeProperty('--card-y');active=null;} };
  document.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || document.body.classList.contains('academy-motion-paused')) { reset(); return; }
    const card = event.target.closest?.('.lesson .word-card');
    if (!card) { reset(); return; }
    if (active !== card) { reset(); active = card; }
    const rect = card.getBoundingClientRect();
    const x = Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
    const y = Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{card.style.setProperty('--card-x',`${-y*3}deg`);card.style.setProperty('--card-y',`${x*4}deg`);frame=0;});
  },{passive:true});
  document.addEventListener('pointerout', event => { if (active && !active.contains(event.relatedTarget)) reset(); });
  reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
  new MutationObserver(()=>{if(document.body.classList.contains('academy-motion-paused'))reset();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
})();
