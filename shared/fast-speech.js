/* MAGIC NEON AI ACADEMY — Shared Speech Engine */
(function(){'use strict';
  if(window.__magicFastSpeech)return;
  window.__magicFastSpeech=true;

  const synth=window.speechSynthesis;
  const supported=!!(synth&&window.SpeechSynthesisUtterance);
  let voices=[];
  let active=null;
  let speakTimer=0;

  const refreshVoices=()=>{
    try{voices=synth.getVoices()||[];}catch(e){voices=[];}
  };
  if(supported){
    refreshVoices();
    if('onvoiceschanged' in synth)synth.addEventListener('voiceschanged',refreshVoices,{passive:true});
  }

  const pickVoice=(lang)=>{
    const wanted=String(lang||'en-US').toLowerCase();
    return voices.find(v=>v.lang&&v.lang.toLowerCase()===wanted)
      ||voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith(wanted.slice(0,2)))
      ||voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith('en'))
      ||voices[0]
      ||null;
  };

  const stop=()=>{
    if(!supported)return;
    clearTimeout(speakTimer);
    try{synth.cancel();}catch(e){}
    active=null;
  };

  const speak=(text,lang='en-US')=>{
    text=String(text||'').trim();
    if(!text||!supported)return false;
    stop();
    try{synth.resume();}catch(e){}

    const u=new SpeechSynthesisUtterance(text);
    u.lang=lang||'en-US';
    u.rate=.92;
    u.pitch=1;
    const voice=pickVoice(u.lang);
    if(voice)u.voice=voice;
    active=u;
    u.onend=()=>{if(active===u)active=null;};
    u.onerror=(e)=>{if(active===u)active=null;console.warn('Magic speech error',e&&e.error||e);};

    // Android Chrome can silently ignore speak() when called immediately after cancel().
    // A short task delay keeps the call tied to the current interaction while allowing
    // the speech queue to settle.
    speakTimer=setTimeout(()=>{
      if(active!==u)return;
      try{synth.resume();synth.speak(u);}catch(e){console.warn('Magic speech start error',e);}
    },40);
    return true;
  };

  window.magicFastSpeak=speak;
  window.magicStopSpeech=stop;
  window.magicSpeechSupported=supported;

  // One shared delegated handler for every Grade 2/3/4 data-speak control.
  document.addEventListener('click',function(e){
    const el=e.target&&e.target.closest?e.target.closest('[data-speak]'):null;
    if(!el)return;
    const text=el.getAttribute('data-speak');
    if(!text)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    speak(text,el.getAttribute('data-lang')||'en-US');
  },true);

  // Warm up/resume the browser speech engine from the first real user gesture.
  document.addEventListener('pointerdown',function(){
    if(!supported)return;
    try{synth.resume();}catch(e){}
  },{capture:true,passive:true});
})();
