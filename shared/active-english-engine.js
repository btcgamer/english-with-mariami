/* English with Mariami — Active English Learning Engine v1
 * Turns lesson vocabulary into repeated, contextual practice without replacing
 * the existing Grade 2/3/4 mission engines.
 */
(function(){
  'use strict';
  const grade=Number(document.body?.dataset?.grade||window.GRADE||window.GRADE23_UNIVERSE?.grade||0);
  if(![2,3,4].includes(grade)) return;
  const KEY=`ewm-active-english-g${grade}`;
  const MAX_REVIEW=8;
  const safe=(v)=>String(v??'').trim();
  const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}};
  const save=(x)=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch(_){}};
  const state=load();
  state.review=Array.isArray(state.review)?state.review:[];
  state.seen=state.seen&&typeof state.seen==='object'?state.seen:{};

  function speak(text){
    text=safe(text); if(!text||!('speechSynthesis' in window)) return;
    try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=grade===2?.86:grade===3?.92:1; speechSynthesis.speak(u)}catch(_){ }
  }

  function collectWords(){
    const nodes=[...document.querySelectorAll('[data-word],.vocabulary-word,.word-card,.vocab-card')];
    return nodes.map(n=>({word:safe(n.dataset.word||n.querySelector('.word,.english-word')?.textContent||n.textContent.split(/\s+/)[0]),translation:safe(n.dataset.translation||n.querySelector('.translation,.meaning')?.textContent),sentence:safe(n.dataset.sentence||n.querySelector('.sentence,.example')?.textContent)})).filter(x=>x.word&&/[a-z]/i.test(x.word)).slice(0,30);
  }

  function queue(words){
    words.forEach(x=>{
      const k=x.word.toLowerCase();
      if(!state.seen[k]) state.seen[k]={word:x.word,translation:x.translation,sentence:x.sentence,correct:0,wrong:0};
      if(!state.review.some(y=>y.word.toLowerCase()===k)) state.review.push(state.seen[k]);
    });
    state.review=state.review.slice(-60); save(state);
  }

  function render(){
    if(document.getElementById('ewm-active-english')) return;
    if(!state.review.length) return;
    const item=state.review[0];
    const box=document.createElement('aside'); box.id='ewm-active-english';
    box.setAttribute('aria-label','English practice');
    box.innerHTML=`<div class="ewm-ae-title">⚡ QUICK ENGLISH PRACTICE</div><div class="ewm-ae-word">${escapeHtml(item.word)}</div>${item.translation?`<div class="ewm-ae-meaning">${escapeHtml(item.translation)}</div>`:''}${item.sentence?`<div class="ewm-ae-sentence">${escapeHtml(item.sentence)}</div>`:''}<div class="ewm-ae-actions"><button type="button" data-ae-speak>🔊 Listen</button><button type="button" data-ae-known>✓ I know it</button><button type="button" data-ae-review>↻ Review again</button></div>`;
    document.body.appendChild(box);
    box.querySelector('[data-ae-speak]').onclick=()=>speak(item.word+(item.sentence?' . '+item.sentence:''));
    box.querySelector('[data-ae-known]').onclick=()=>complete(true);
    box.querySelector('[data-ae-review]').onclick=()=>complete(false);
  }
  function complete(ok){
    const item=state.review.shift(); if(!item)return;
    const k=item.word.toLowerCase(); state.seen[k]=state.seen[k]||item;
    if(ok) state.seen[k].correct=(state.seen[k].correct||0)+1;
    else {state.seen[k].wrong=(state.seen[k].wrong||0)+1; state.review.push(item);}
    save(state); document.getElementById('ewm-active-english')?.remove(); setTimeout(render,250);
  }
  function escapeHtml(s){return safe(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function injectStyle(){
    if(document.getElementById('ewm-active-english-style'))return;
    const s=document.createElement('style');s.id='ewm-active-english-style';s.textContent=`#ewm-active-english{position:fixed;right:18px;bottom:18px;z-index:99999;width:min(360px,calc(100vw - 36px));padding:18px;border:1px solid rgba(120,220,255,.55);border-radius:18px;background:rgba(5,10,28,.94);box-shadow:0 0 28px rgba(80,190,255,.22);color:#fff;font-family:inherit;backdrop-filter:blur(12px)}#ewm-active-english .ewm-ae-title{font-size:11px;letter-spacing:1.5px;opacity:.8;margin-bottom:8px}#ewm-active-english .ewm-ae-word{font-size:28px;font-weight:800;margin:4px 0}#ewm-active-english .ewm-ae-meaning{opacity:.85;margin-bottom:8px}#ewm-active-english .ewm-ae-sentence{font-size:14px;line-height:1.45;margin:10px 0 14px}#ewm-active-english .ewm-ae-actions{display:flex;gap:7px;flex-wrap:wrap}#ewm-active-english button{border:1px solid rgba(255,255,255,.22);border-radius:10px;padding:8px 10px;background:rgba(255,255,255,.08);color:#fff;cursor:pointer}#ewm-active-english button:hover{transform:translateY(-1px)}`;document.head.appendChild(s);
  }
  function boot(){
    queue(collectWords()); injectStyle(); setTimeout(render,900);
    document.addEventListener('click',e=>{if(e.target.closest('[data-word],.vocabulary-word,.word-card,.vocab-card'))setTimeout(()=>queue(collectWords()),100)},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
