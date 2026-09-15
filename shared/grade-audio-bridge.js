/* MAGIC NEON AI ACADEMY — Grade Audio Integration Bridge
   Routes every lesson [data-speak] control through the verified shared speech engine.
   Designed for mobile Chrome/Safari and dynamic lesson DOM rendering. */
(function(){'use strict';
  if(window.__magicGradeAudioBridge)return;
  window.__magicGradeAudioBridge=true;

  const getText=el=>String(el?.getAttribute('data-speak')||el?.dataset?.speak||'').trim();
  const play=el=>{
    const text=getText(el); if(!text)return false;
    const lang=el.getAttribute('data-lang')||'en-US';
    try{
      if(typeof window.magicFastSpeak==='function') return window.magicFastSpeak(text,lang)!==false;
    }catch(err){console.warn('Grade audio bridge shared engine failed',err);}
    try{
      const synth=window.speechSynthesis;
      if(!synth||!window.SpeechSynthesisUtterance)return false;
      synth.cancel(); synth.resume();
      const u=new SpeechSynthesisUtterance(text); u.lang=lang; u.rate=.92; u.pitch=1;
      synth.speak(u); return true;
    }catch(err){console.warn('Grade audio bridge native fallback failed',err);return false;}
  };

  const intercept=e=>{
    const el=e.target&&e.target.closest?e.target.closest('[data-speak]'):null;
    if(!el||el.disabled)return;
    const text=getText(el); if(!text)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    play(el);
  };

  /* pointerup is important on mobile: it keeps speech directly tied to the
     user's gesture before a later click/navigation handler can interfere. */
  document.addEventListener('pointerup',intercept,true);
  document.addEventListener('click',intercept,true);
  document.addEventListener('touchend',function(e){
    const el=e.target&&e.target.closest?e.target.closest('[data-speak]'):null;
    if(!el||el.disabled||!getText(el))return;
    try{if(typeof window.magicFastSpeak==='function')play(el);}catch(err){}
  },{capture:true,passive:false});

  window.magicGradeAudio={play, supported:!!(window.speechSynthesis&&window.SpeechSynthesisUtterance)};
})();
