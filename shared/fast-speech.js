/* MAGIC NEON AI ACADEMY — Fast Speech Layer */
(function(){'use strict';
  if(window.__magicFastSpeech)return;
  window.__magicFastSpeech=true;
  const synth=window.speechSynthesis;
  if(!synth)return;
  let voices=[];
  const refreshVoices=()=>{voices=synth.getVoices()||[];};
  refreshVoices();
  if('onvoiceschanged' in synth)synth.addEventListener('voiceschanged',refreshVoices,{passive:true});
  let active=null;
  const pickVoice=(lang)=>{
    const wanted=String(lang||'en-US').toLowerCase();
    return voices.find(v=>v.lang&&v.lang.toLowerCase()===wanted)
      ||voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith(wanted.slice(0,2)))
      ||voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith('en'))
      ||null;
  };
  const nativeSpeak=synth.speak.bind(synth);
  const prepare=(u)=>{
    if(!u)return u;
    try{
      const lang=u.lang||'en-US';
      u.lang=lang;
      u.rate=.92;
      u.pitch=1;
      const voice=pickVoice(lang);
      if(voice)u.voice=voice;
    }catch(e){}
    return u;
  };
  const fastNativeSpeak=(u)=>{
    try{
      if(active&&active!==u){try{active.onend=null;active.onerror=null;}catch(e){};active=null;}
      synth.cancel();
      synth.resume();
      nativeSpeak(prepare(u));
    }catch(e){console.warn('Fast native speech error',e);}
  };
  try{synth.speak=fastNativeSpeak;}catch(e){}
  const speak=(text,lang='en-US')=>{
    text=String(text||'').trim();
    if(!text)return;
    try{
      if(active){try{active.onend=null;active.onerror=null;}catch(e){};active=null;}
      synth.cancel();
      synth.resume();
      const u=new SpeechSynthesisUtterance(text);
      u.lang=lang;
      u.rate=.92;
      u.pitch=1;
      const voice=pickVoice(lang);
      if(voice)u.voice=voice;
      active=u;
      u.onend=()=>{if(active===u)active=null;};
      u.onerror=()=>{if(active===u)active=null;};
      nativeSpeak(u);
    }catch(e){console.warn('Fast speech error',e);}
  };
  document.addEventListener('click',function(e){
    const el=e.target.closest&&e.target.closest('[data-speak]');
    if(!el)return;
    const text=el.getAttribute('data-speak');
    if(!text)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    speak(text,el.getAttribute('data-lang')||'en-US');
  },true);
  window.magicFastSpeak=speak;
})();
