/* MAGIC NEON AI ACADEMY — Shared Speech Engine + Mobile Diagnostic */
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
    refreshVoices();
    const voice=pickVoice(u.lang);
    if(voice)u.voice=voice;
    active=u;
    u.onend=()=>{if(active===u)active=null;};
    u.onerror=(e)=>{if(active===u)active=null;console.warn('Magic speech error',e&&e.error||e);};

    speakTimer=setTimeout(()=>{
      if(active!==u)return;
      try{synth.resume();synth.speak(u);}catch(e){console.warn('Magic speech start error',e);}
    },40);
    return true;
  };

  window.magicFastSpeak=speak;
  window.magicStopSpeech=stop;
  window.magicSpeechSupported=supported;

  // Shared delegated handler for Grade 2/3/4 data-speak controls.
  document.addEventListener('click',function(e){
    const el=e.target&&e.target.closest?e.target.closest('[data-speak]'):null;
    if(!el)return;
    const text=el.getAttribute('data-speak');
    if(!text)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    speak(text,el.getAttribute('data-lang')||'en-US');
  },true);

  document.addEventListener('pointerdown',function(){
    if(!supported)return;
    try{synth.resume();}catch(e){}
  },{capture:true,passive:true});

  // Real-device diagnostic. It only runs after an explicit user click and does not
  // claim that sound exists merely because speechSynthesis is present.
  const diagnostic=()=>{
    const started=Date.now();
    refreshVoices();
    const english=voices.filter(v=>/^en(?:-|$)/i.test(v.lang||''));
    const report={
      supported,
      voices:voices.length,
      englishVoices:english.length,
      selectedVoice:(pickVoice('en-US')||{}).name||null,
      selectedLang:(pickVoice('en-US')||{}).lang||null,
      speaking:!!(synth&&synth.speaking),
      pending:!!(synth&&synth.pending),
      paused:!!(synth&&synth.paused),
      userAgent:navigator.userAgent,
      started:false,
      ended:false,
      error:null,
      elapsed:null
    };
    const u=new SpeechSynthesisUtterance('Hello. This is the English with Mariami audio test.');
    u.lang='en-US';
    u.rate=.9;
    const v=pickVoice('en-US');
    if(v)u.voice=v;
    u.onstart=()=>{report.started=true;report.elapsed=Date.now()-started;renderDiagnostic(report,'STARTED — sound engine accepted the test');};
    u.onend=()=>{report.ended=true;report.elapsed=Date.now()-started;renderDiagnostic(report,'ENDED — speech event completed');};
    u.onerror=(e)=>{report.error=e&&e.error?String(e.error):'unknown';report.elapsed=Date.now()-started;renderDiagnostic(report,'ERROR — '+report.error);};
    try{
      synth.cancel();
      synth.resume();
      synth.speak(u);
      renderDiagnostic(report,'SENT — waiting for STARTED / ERROR');
    }catch(e){
      report.error=e&&e.message?e.message:String(e);
      renderDiagnostic(report,'ERROR — '+report.error);
    }
  };

  const renderDiagnostic=(r,status)=>{
    const box=document.getElementById('magic-speech-diagnostic');
    if(!box)return;
    box.querySelector('[data-sd-status]').textContent=status;
    box.querySelector('[data-sd-body]').textContent=
      'API: '+(r.supported?'SUPPORTED':'NOT SUPPORTED')+'\n'+
      'Voices: '+r.voices+' (English: '+r.englishVoices+')\n'+
      'Voice: '+(r.selectedVoice||'NONE')+(r.selectedLang?' ['+r.selectedLang+']':'')+'\n'+
      'Started: '+r.started+' | Ended: '+r.ended+'\n'+
      'Speaking: '+r.speaking+' | Pending: '+r.pending+' | Paused: '+r.paused+'\n'+
      'Error: '+(r.error||'NONE')+'\n'+
      'Device: '+r.userAgent;
  };

  const installDiagnostic=()=>{
    if(document.getElementById('magic-speech-diagnostic'))return;
    const box=document.createElement('section');
    box.id='magic-speech-diagnostic';
    box.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483647;padding:14px;border:1px solid rgba(80,220,255,.65);border-radius:14px;background:rgba(5,10,25,.96);color:#dffaff;font:13px/1.45 system-ui,sans-serif;box-shadow:0 0 24px rgba(0,220,255,.22);backdrop-filter:blur(10px);display:none;';
    box.innerHTML='<div style="display:flex;gap:8px;align-items:center;justify-content:space-between"><strong>🔊 AUDIO DIAGNOSTIC</strong><button type="button" data-sd-close style="padding:6px 10px">×</button></div><div data-sd-status style="margin:8px 0;font-weight:700">READY</div><pre data-sd-body style="white-space:pre-wrap;margin:0;max-height:34vh;overflow:auto"></pre><button type="button" data-sd-test style="margin-top:10px;padding:9px 12px;border-radius:9px">▶ TEST AUDIO</button>';
    document.body.appendChild(box);
    box.querySelector('[data-sd-close]').onclick=()=>{box.style.display='none';};
    box.querySelector('[data-sd-test]').onclick=diagnostic;
  };

  const exposeDiagnostic=()=>{
    installDiagnostic();
    const box=document.getElementById('magic-speech-diagnostic');
    box.style.display='block';
    renderDiagnostic({supported,voices:voices.length,englishVoices:voices.filter(v=>/^en(?:-|$)/i.test(v.lang||'')).length,selectedVoice:(pickVoice('en-US')||{}).name||null,selectedLang:(pickVoice('en-US')||{}).lang||null,speaking:!!synth.speaking,pending:!!synth.pending,paused:!!synth.paused,started:false,ended:false,error:null,userAgent:navigator.userAgent},'READY — tap TEST AUDIO');
  };
  window.magicOpenSpeechDiagnostic=exposeDiagnostic;
})();