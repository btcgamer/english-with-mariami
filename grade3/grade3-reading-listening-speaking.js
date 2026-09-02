/* Grade 3 Reading / Listening / Speaking practice layer. */
(function(){
  'use strict';
  var activeMission=-1,mounted=false,observer=null;
  function worlds(){return (window.GRADE3_FUTURISTIC_CONTENT&&window.GRADE3_FUTURISTIC_CONTENT.worlds)||[]}
  function getWorld(){return worlds()[activeMission]||null}
  function textOf(v,key){if(typeof v==='string')return v;if(v&&typeof v==='object')return v[key]||v.text||v.prompt||v.content||'';return ''}
  function esc(v){return String(v??'').replace(/[&<>\"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'})[c]})}
  function norm(v){return String(v??'').toLowerCase().trim().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ')}
  function speak(t){if(!t||!('speechSynthesis'in window))return;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=.82;speechSynthesis.speak(u)}
  function quizItems(w,type){return Array.isArray(w.quiz)?w.quiz.filter(function(q){return q&&q.type===type}):[]}
  function qaFor(w,type){var q=quizItems(w,type)[0];if(!q)return null;var answer=Array.isArray(q.options)?q.options[Number(q.answer)]:q.answer;return {question:q.q||q.question||'',answer:String(answer??'')}}
  function stringQA(w){if(typeof w.quiz!=='string')return null;var s=w.quiz.trim(),i=s.indexOf('?');if(i<0)return null;return {question:s.slice(0,i+1),answer:s.slice(i+1).trim().replace(/^[-:]+\s*/,'')}}
  function mount(modal){
    if(!modal||modal.querySelector('.g3ls-root'))return;
    var w=getWorld();if(!w)return;
    var reading=textOf(w.reading,'text'),speaking=textOf(w.speaking,'prompt');
    var listening=textOf(w.listen,'text');
    var readingQA=qaFor(w,'reading'),listeningQA=qaFor(w,'listening')||stringQA(w);
    if(!reading&&!listening&&!speaking)return;
    var root=document.createElement('section');root.className='g3ls-root';
    var html='<div class="g3ls-title">LEARNING CHALLENGES</div>';
    if(reading){html+='<article class="g3ls-card"><h3>📖 READING CHALLENGE</h3><p class="g3ls-reading">'+esc(reading)+'</p><button type="button" class="g3ls-btn" data-read>🔊 HEAR READING</button>';
      if(readingQA)html+='<div class="g3ls-task"><p><b>'+esc(readingQA.question)+'</b></p><input class="g3ls-input" data-reading-answer autocomplete="off" placeholder="Type your answer"><button type="button" class="g3ls-btn" data-reading-check>CHECK</button><div class="g3ls-feedback" data-reading-feedback></div></div>';
      html+='</article>'}
    if(listening){html+='<article class="g3ls-card"><h3>🎧 LISTENING CHALLENGE</h3><p>Listen first, then answer the question.</p><button type="button" class="g3ls-btn" data-listen>▶ PLAY</button>';
      if(listeningQA)html+='<div class="g3ls-task"><p><b>'+esc(listeningQA.question)+'</b></p><input class="g3ls-input" data-listening-answer autocomplete="off" placeholder="Type what you heard"><button type="button" class="g3ls-btn" data-listening-check>CHECK</button><div class="g3ls-feedback" data-listening-feedback></div></div>';
      else html+='<div class="g3ls-feedback">Listening text available — press PLAY and repeat the key phrase aloud.</div>';
      html+='</article>'}
    if(speaking){html+='<article class="g3ls-card"><h3>🎤 SPEAKING CHALLENGE</h3><p>'+esc(speaking)+'</p><button type="button" class="g3ls-btn" data-model>🔊 HEAR MODEL</button><button type="button" class="g3ls-btn" data-speak>🎙️ SPEAK NOW</button><div class="g3ls-feedback" data-speaking-feedback></div></article>'}
    root.innerHTML=html;
    root.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-read'))speak(reading);
      if(b.hasAttribute('data-listen'))speak(listening);
      if(b.hasAttribute('data-model'))speak(speaking);
      if(b.hasAttribute('data-reading-check')){var input=root.querySelector('[data-reading-answer]'),out=root.querySelector('[data-reading-feedback]');var ok=readingQA&&norm(input&&input.value)===norm(readingQA.answer);out.textContent=ok?'✓ Correct!':'✗ Try again.';if(ok)b.disabled=true}
      if(b.hasAttribute('data-listening-check')){var input2=root.querySelector('[data-listening-answer]'),out2=root.querySelector('[data-listening-feedback]');var a=norm(input2&&input2.value),expected=norm(listeningQA&&listeningQA.answer);var ok2=!!a&&!!expected&&(a===expected||a.includes(expected)||expected.includes(a));out2.textContent=ok2?'✓ Correct!':'✗ Listen again and try again.';if(ok2)b.disabled=true}
      if(b.hasAttribute('data-speak')){
        var out3=root.querySelector('[data-speaking-feedback]'),SR=window.SpeechRecognition||window.webkitSpeechRecognition;
        if(!SR){out3.textContent='🎤 Voice recognition is not available here. Say the model aloud, then continue.';return}
        b.disabled=true;out3.textContent='🎧 Listening for your voice…';var r=new SR();r.lang='en-US';r.interimResults=false;r.maxAlternatives=1;
        r.onresult=function(ev){var heard=String(ev.results&&ev.results[0]&&ev.results[0][0]&&ev.results[0][0].transcript||'').trim();out3.textContent=heard?'✓ Speech detected: '+heard:'✗ No speech detected. Try again.';b.disabled=false};
        r.onerror=function(){out3.textContent='✗ Voice recognition could not complete. Try again.';b.disabled=false};r.onend=function(){b.disabled=false};r.start();
      }
    });
    var anchor=modal.querySelector('.g3sb-root,.g3-quiz,.quiz,.g3-complete,button');if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(root,anchor);else modal.appendChild(root);mounted=true;
  }
  function watch(){if(observer)return;observer=new MutationObserver(function(){if(mounted)return;var modal=document.querySelector('.g3-vocab-modal');if(modal)mount(modal)});observer.observe(document.body,{childList:true,subtree:true})}
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.mission button');if(b){var card=b.closest('.mission'),cards=Array.prototype.slice.call(document.querySelectorAll('.mission'));activeMission=cards.indexOf(card);mounted=false}},true);
  document.addEventListener('click',function(e){if(e.target.id==='start')mounted=false},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
