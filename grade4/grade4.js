(function(){
'use strict';
const baseWorlds=[
['01','🧩','Grammar Core','Grammar rules, tenses and sentence building.'],
['02','📖','Story Station','Reading, comprehension and storytelling.'],
['03','🗣️','Speak Lab','Speaking phrases, dialogue and communication.'],
['04','🔤','Word Forge','Vocabulary, synonyms, opposites and useful words.'],
['05','🌍','World Explorer','Places, cultures, geography and travel English.'],
['06','🔬','Science Hub','Science, experiments, nature and facts.'],
['07','🎭','Drama Zone','Characters, dialogue and expressive English.'],
['08','🎵','Music Pulse','Listening, rhythm and music vocabulary.'],
['09','💻','Tech Lab','Technology, devices and digital life.'],
['10','🧠','Brain Quest','Questions, logic and problem solving.'],
['11','🌟','Star Academy','Mixed Grade 4 skills challenge.'],
['12','🏆','Final Core','Final Grade 4 mastery mission.']
];
const KEY='grade4UniverseProgress';
let state={xp:0,stars:0,streak:0,done:[],last:null};
try{const old=JSON.parse(localStorage.getItem(KEY)||'{}');if(old&&typeof old==='object')state={...state,...old};}catch(e){}
state.done=Array.isArray(state.done)?state.done:[];
state.xp=Number.isFinite(+state.xp)?+state.xp:0;
state.stars=Number.isFinite(+state.stars)?+state.stars:0;
state.streak=Number.isFinite(+state.streak)?+state.streak:0;
const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lessons=[];
let words=[];
let quizzes=[];
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function arr(v){return Array.isArray(v)?v:[];}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}updateStats();}
function updateStats(){[['#xp',state.xp],['#stars',state.stars],['#streak',state.streak],['#done',state.done.length]].forEach(([q,v])=>{const el=document.querySelector(q);if(el)el.textContent=v;});}
function speak(text){if(!('speechSynthesis'in window)||!text)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text));u.lang='en-US';u.rate=.82;speechSynthesis.speak(u);}
function tilt(e){const c=e.currentTarget,r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(900px) rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateY(-5px)`;}
function resetTilt(e){e.currentTarget.style.transform='';}
function render(){
 const root=document.querySelector('#missions');if(!root)return;
 if(!lessons.length){root.innerHTML='<div class="mission"><span class="num">LIVE CURRICULUM</span><h3>No Grade 4 lessons returned</h3><p>Check your signed-in student access and Supabase policies.</p></div>';return;}
 root.innerHTML=baseWorlds.map((b,i)=>{
   const group=lessons.filter(l=>Math.floor((Number(l.lesson_number||1)-1)/5)===i);
   const wc=group.reduce((n,l)=>n+(l.words?.length||0),0);
   const qc=group.reduce((n,l)=>n+(l.quizzes?.length||0),0);
   const doneCount=group.filter(l=>state.done.includes(l.id)).length;
   return `<article class="mission u-holo ${doneCount===group.length?'done':''}" data-world="${i}" tabindex="0"><span class="num">WORLD ${b[0]} • ${doneCount}/${group.length} COMPLETE</span><span class="icon">${b[1]}</span><h3>${esc(b[2])}</h3><p>${esc(b[3])}</p><div class="g4-vocab-preview">${group.length} live lessons • ${wc} words • ${qc} quiz questions</div><button class="g4-open" type="button">OPEN WORLD →</button></article>`;
 }).join('');
 root.querySelectorAll('.mission').forEach(c=>{c.addEventListener('click',()=>openWorld(+c.dataset.world));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openWorld(+c.dataset.world);}});if(!reduced){c.addEventListener('pointermove',tilt);c.addEventListener('pointerleave',resetTilt);}});
}
function lessonMarkup(l){
 const ws=arr(l.words),qs=arr(l.quizzes),examples=arr(l.grammar_examples),phrases=arr(l.speaking_phrases),ex=arr(l.exercises);
 return `<section class="g4-live-lesson"><div class="g4-live-lesson-head"><span class="num">LESSON ${esc(l.lesson_number)}</span><h3>${esc(l.title||'Grade 4 Lesson')}</h3><p>${esc(l.topic||l.description||'')}</p></div>
 ${l.grammar_rule?`<div class="g4-content-box"><b>🧠 GRAMMAR</b><p>${esc(l.grammar_rule)}</p>${examples.length?`<ul>${examples.map(x=>`<li>${esc(typeof x==='string'?x:(x.example||x.text||JSON.stringify(x)))}</li>`).join('')}</ul>`:''}</div>`:''}
 ${l.reading_text?`<div class="g4-content-box"><b>📖 READING</b><p>${esc(l.reading_text)}</p></div>`:''}
 ${l.listening_text?`<div class="g4-content-box"><b>🎧 LISTENING</b><p>${esc(l.listening_text)}</p><button class="g4-speak-text" data-text="${esc(l.listening_text)}">🔊 LISTEN</button></div>`:''}
 ${phrases.length?`<div class="g4-content-box"><b>🗣️ SPEAKING</b><ul>${phrases.map(x=>`<li>${esc(typeof x==='string'?x:(x.phrase||x.text||JSON.stringify(x)))}</li>`).join('')}</ul></div>`:''}
 ${ex.length?`<div class="g4-content-box"><b>✍️ EXERCISES</b><ul>${ex.map(x=>`<li>${esc(typeof x==='string'?x:(x.question||x.text||JSON.stringify(x)))}</li>`).join('')}</ul></div>`:''}
 ${ws.length?`<div class="g4-live-words"><b>🔤 VOCABULARY • ${ws.length}</b>${ws.map(w=>`<div class="g4-word"><div><strong>${esc(w.word)}</strong><span>${esc(w.translation||'')}${w.emoji?' '+esc(w.emoji):''}</span></div><button type="button" data-speak="${esc(w.word)}">🔊</button></div>`).join('')}</div>`:''}
 ${qs.length?`<details class="g4-quiz"><summary>🎯 QUIZ • ${qs.length} QUESTIONS</summary>${qs.map((q,n)=>`<div><b>${n+1}. ${esc(q.question)}</b><p>${arr(q.options).map(o=>`<span class="g4-option">${esc(o)}</span>`).join('')}</p></div>`).join('')}</details>`:''}
 <button class="g4-complete" data-complete="${esc(l.id)}">✓ COMPLETE LESSON • +25 XP</button></section>`;
}
function openWorld(i){
 const group=lessons.filter(l=>Math.floor((Number(l.lesson_number||1)-1)/5)===i),b=baseWorlds[i];
 const modal=document.createElement('div');modal.className='g4-vocab-modal';modal.innerHTML=`<div class="g4-vocab-dialog g4-live-dialog" role="dialog" aria-modal="true"><button class="g4-close" type="button" aria-label="Close">×</button><div class="g4-modal-icon">${b[1]}</div><span class="num">WORLD ${b[0]}</span><h2>${esc(b[2])}</h2><p>${esc(b[3])}</p><div>${group.map(lessonMarkup).join('')}</div></div>`;
 document.body.appendChild(modal);const close=()=>modal.remove();modal.querySelector('.g4-close').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close();const sp=e.target.closest('[data-speak]');if(sp)speak(sp.getAttribute('data-speak'));const st=e.target.closest('[data-text]');if(st)speak(st.getAttribute('data-text'));const cp=e.target.closest('[data-complete]');if(cp)completeLesson(cp.getAttribute('data-complete'),modal);});requestAnimationFrame(()=>modal.classList.add('show'));modal.querySelector('.g4-close').focus();
}
function completeLesson(id,modal){if(!id)return;if(state.done.includes(id)){const b=modal.querySelector(`[data-complete="${CSS.escape(id)}"]`);if(b)b.textContent='✓ LESSON ALREADY COMPLETE';return;}state.done.push(id);state.xp+=25;state.stars+=1;state.streak=Math.max(1,state.streak+1);state.last=Date.now();save();render();const b=modal.querySelector(`[data-complete="${CSS.escape(id)}"]`);if(b)b.textContent='✓ COMPLETED • +25 XP';}
async function loadCurriculum(){
 const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
 const live=document.querySelector('#liveStats');
 if(!client){if(live)live.textContent='⚠ SUPABASE CLIENT NOT AVAILABLE';render();return;}
 try{
   const lr=await client.from('lessons').select('id,grade,lesson_number,title,topic,description,image_url,audio_url,grammar_rule,grammar_examples,listening_text,speaking_phrases,reading_text,exercises').eq('grade',4).order('lesson_number',{ascending:true});
   if(lr.error)throw lr.error;lessons=arr(lr.data);
   const ids=lessons.map(x=>x.id);
   if(ids.length){
     const [wr,qr]=await Promise.all([
       client.from('lesson_words').select('id,lesson_id,word,translation,emoji,image_url,audio_url,sort_order').in('lesson_id',ids).order('sort_order',{ascending:true}),
       client.from('lesson_quizzes').select('id,lesson_id,question,options,correct_answer,sort_order').in('lesson_id',ids).order('sort_order',{ascending:true})
     ]);
     if(wr.error)throw wr.error;if(qr.error)throw qr.error;words=arr(wr.data);quizzes=arr(qr.data);
     const wm=new Map(),qm=new Map();words.forEach(w=>{if(!wm.has(w.lesson_id))wm.set(w.lesson_id,[]);wm.get(w.lesson_id).push(w);});quizzes.forEach(q=>{if(!qm.has(q.lesson_id))qm.set(q.lesson_id,[]);qm.get(q.lesson_id).push(q);});lessons.forEach(l=>{l.words=wm.get(l.id)||[];l.quizzes=qm.get(l.id)||[];});
   }
   if(live)live.textContent=`⚡ LIVE: ${lessons.length} LESSONS • ${words.length} WORDS • ${quizzes.length} QUIZ QUESTIONS`;
 }catch(err){console.warn('Grade 4 curriculum load failed',err);if(live)live.textContent='⚠ LIVE CURRICULUM ERROR — CHECK ACCESS POLICIES';}
 render();updateStats();
}
function robot(){if(document.querySelector('.g4-robot'))return;const r=document.createElement('button');r.className='g4-robot';r.type='button';r.setAttribute('aria-label','AI Robot');r.innerHTML='<span>🤖</span>';r.title='Tap me!';r.addEventListener('click',()=>{r.classList.remove('dance');void r.offsetWidth;r.classList.add('dance');});document.body.appendChild(r);}
const start=document.querySelector('#start'),review=document.querySelector('#review');
if(start)start.onclick=()=>document.querySelector('#missions')?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
if(review)review.onclick=()=>{review.textContent=`🏆 ${state.done.length}/${lessons.length||60} • ${state.xp} XP • ⭐ ${state.stars} • 🔥 ${state.streak}`;setTimeout(()=>{review.textContent='🏆 MISSION STATUS';},2200);};
updateStats();robot();loadCurriculum();
})();
