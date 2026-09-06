/* Grade 2/3 offline recovery — prevents an empty/stuck curriculum when Supabase is unreachable. */
(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase();
  const grade=path.includes('/grade2')?'2':path.includes('/grade3')?'3':'';
  if(!grade)return;
  const delay=4500;
  const timer=setTimeout(function(){
    if(grade==='2')recoverG2();
    if(grade==='3')recoverG3();
  },delay);
  function esc(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function recoverG2(){
    const root=document.querySelector('#lessonGrid');
    if(!root||root.children.length)return;
    const topics=['Greetings & Friends','Numbers & Colors','My Family','My Home','Animals','Food Time','My Clothes','Weather','My School','Transport','Nature','Final Review'];
    const icons=['👋','🔢','👨‍👩‍👧','🏠','🐾','🍎','👕','🌦️','🏫','🚌','🌳','🏆'];
    root.innerHTML=Array.from({length:60},(_,i)=>{
      const n=i+1,t=topics[i%topics.length];
      return `<article class="lesson u-holo" data-i="${i}" data-offline-grade23="2"><div class="mission-no">${n===60?'FINAL MISSION':'MISSION '+String(n).padStart(2,'0')}</div><div class="scene">${icons[i%icons.length]}</div><h3>${esc(t)}</h3><p class="ka">Magic AI English Mission</p><p class="desc">Offline recovery mode • vocabulary • grammar • speaking • practice</p><div class="lesson-foot"><span class="stars">☆☆☆☆☆</span><button class="enter" type="button">ENTER →</button></div></article>`;
    }).join('');
    root.addEventListener('click',g2Open,{once:false});
    window.__EWM_G23_OFFLINE_G2=true;
    console.warn('[Grade 2] Supabase unavailable — offline recovery curriculum activated.');
  }
  function g2Open(e){
    const card=e.target.closest('[data-offline-grade23="2"]');
    if(!card)return;
    const n=Number(card.dataset.i)+1;
    const modal=document.querySelector('#modal');
    const content=document.querySelector('#modalContent');
    if(!modal||!content)return;
    content.innerHTML=`<div class="mission">GRADE 2 • ${String(n).padStart(2,'0')} • OFFLINE RECOVERY</div><h2 class="modal-title">Magic AI Mission ${n}</h2><p class="modal-ka">Practice English with vocabulary, grammar, reading, listening and speaking.</p><div class="tabs"><button class="tab active">📘 OVERVIEW</button></div><div id="activity"><h3>🚀 Mission Core</h3><p>This mission is available while the online curriculum server is unreachable. Your normal Supabase curriculum will return automatically when the connection is restored.</p><h3>📚 Vocabulary</h3><p>hello • friend • school • family • book • learn</p><h3>🎯 Practice</h3><p>Say three English sentences about your day.</p><button type="button" data-offline-close="1">✓ COMPLETE PRACTICE</button></div>`;
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');
    content.querySelector('[data-offline-close]')?.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')});
  }
  function recoverG3(){
    const root=document.querySelector('#missions');
    if(!root||!root.textContent.includes('Loading learning worlds'))return;
    const data=window.GRADE3_FUTURISTIC_CONTENT?.worlds;
    if(!Array.isArray(data)||!data.length)return;
    root.innerHTML=data.slice(0,60).map((w,i)=>`<article class="mission u-holo" data-i="${i}" data-offline-grade23="3"><span class="num">${i===data.length-1?'FINAL MISSION':'MISSION '+esc(w.id||String(i+1).padStart(2,'0'))} • ${esc(w.category||'LEARNING').toUpperCase()}</span><span class="icon">${esc(w.icon||'🚀')}</span><h3>${esc(w.title||'Mission '+(i+1))}</h3><p>${esc(w.desc||'Grade 3 English mission')}</p><small class="g3-ka">${esc(w.ka||'Grade 3 Core')}</small><div class="g3-mission-meta">${Array.isArray(w.words)?w.words.length:0} WORDS • ${Array.isArray(w.quiz)?w.quiz.length:0} QUIZ • READING • LISTENING • SPEAKING</div><button class="g3-open" type="button">OPEN MISSION →</button></article>`).join('');
    root.addEventListener('click',g3Open);
    window.__EWM_G23_OFFLINE_G3=true;
    console.warn('[Grade 3] Supabase unavailable — local curriculum activated.');
  }
  function g3Open(e){
    const card=e.target.closest('[data-offline-grade23="3"]');
    if(!card)return;
    const w=window.GRADE3_FUTURISTIC_CONTENT?.worlds?.[Number(card.dataset.i)];
    if(!w)return;
    let modal=document.querySelector('#g23OfflineModal');
    if(!modal){modal=document.createElement('div');modal.id='g23OfflineModal';modal.className='g3-vocab-modal';document.body.appendChild(modal)}
    const words=(w.words||[]).map(v=>`<div class="g3-word"><div><strong>${esc(v[0])}</strong><span>${esc(v[1])}</span></div></div>`).join('');
    modal.innerHTML=`<div class="g3-vocab-dialog" role="dialog" aria-modal="true"><button class="g3-close" type="button">×</button><div class="g3-modal-icon">${esc(w.icon||'🚀')}</div><div class="num">MISSION ${esc(w.id||'')}</div><h2>${esc(w.title||'Grade 3 Mission')}</h2><p>${esc(w.desc||'')}</p><section class="g3-section"><h3>🧠 GRAMMAR CORE</h3><p>${esc(w.grammar||'Practice the key grammar point.')}</p></section><section class="g3-section"><h3>🎧 LISTENING</h3><p>${esc(w.listen||'')}</p></section><section class="g3-section"><h3>📚 VOCABULARY</h3><div class="g3-word-list">${words}</div></section><section class="g3-section"><h3>📖 READING</h3><p>${esc(w.reading||'')}</p></section><button class="g3-complete" type="button">✓ COMPLETE PRACTICE</button></div>`;
    modal.querySelector('.g3-close').onclick=()=>modal.remove();
    modal.querySelector('.g3-complete').onclick=()=>{modal.remove();card.classList.add('done')};
  }
})();
