/* English with Mariami — fast, reliable listening engine for student + teacher grade pages. */
(function(){
  'use strict';
  if(window.__EWM_LISTENING_ENGINE__) return;
  window.__EWM_LISTENING_ENGINE__=true;

  const synth=window.speechSynthesis;
  if(!synth || !window.SpeechSynthesisUtterance) return;
  let voices=[];
  let voicesReady=false;

  function loadVoices(){
    try{ voices=synth.getVoices()||[]; voicesReady=voices.length>0; }catch(e){}
  }
  loadVoices();
  if(typeof synth.addEventListener==='function') synth.addEventListener('voiceschanged',function(){loadVoices();});

  function textOf(el){
    if(!el) return '';
    const raw=el.dataset.listenText||el.dataset.speech||el.dataset.speak||el.dataset.text;
    if(raw) return String(raw).replace(/\s+/g,' ').trim();
    return String(el.textContent||'').replace(/^(listen|მოსმენა|🔊)\s*[:\-–—]?\s*/i,'').replace(/\s+/g,' ').trim();
  }

  function pickVoice(){
    return voices.find(v=>/^en-US$/i.test(v.lang)) ||
      voices.find(v=>/^en-/i.test(v.lang)) ||
      voices.find(v=>/english/i.test(v.name)) || voices[0] || null;
  }

  function speak(text,button){
    text=String(text||'').replace(/\s+/g,' ').trim();
    if(!text) return;
    try{
      synth.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang='en-US'; u.rate=.92; u.pitch=1; u.volume=1;
      const v=pickVoice(); if(v) u.voice=v;
      if(button) button.setAttribute('aria-busy','true');
      const done=()=>{if(button) button.removeAttribute('aria-busy');};
      u.onend=done; u.onerror=done;
      /* Some Android Chrome builds need one event-loop turn after cancel(). */
      window.setTimeout(()=>{
        try{ synth.speak(u); }catch(e){done();}
      },0);
      /* If speech was silently dropped, retry once after voices become available. */
      if(!voicesReady){
        window.setTimeout(()=>{
          if(!synth.speaking && !synth.pending){
            try{loadVoices(); synth.speak(u);}catch(e){done();}
          }
        },120);
      }
    }catch(e){ if(button) button.removeAttribute('aria-busy'); }
  }

  window.EWMListen={speak:speak,textOf:textOf};

  document.addEventListener('click',function(ev){
    const button=ev.target.closest?.('[data-speak],[data-speech],[data-listen],.listen,.sound,button[aria-label*="listen" i]');
    if(!button) return;
    const text=textOf(button);
    if(!text) return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    speak(text,button);
  },true);
})();
