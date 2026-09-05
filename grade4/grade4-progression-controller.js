/* English with Mariami — Grade 4 authoritative progression controller */
(function(){
  'use strict';
  const GRADE=4, TOTAL=60;
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  let lessons=[], remoteDone=new Set(), localDone=new Set(), busy=false;

  const qs=s=>document.querySelector(s);
  const lessonNo=l=>Number(l.lesson_number)||Number(l.order_index)||Number(l.position)||0;
  const sortLessons=a=>a.slice().sort((x,y)=>lessonNo(x)-lessonNo(y));
  const worldIndex=l=>Math.min(5,Math.max(0,Math.floor((lessonNo(l)-1)/10)));
  const worldName=i=>`WORLD ${i+1}`;

  function localState(){
    try{const s=JSON.parse(localStorage.getItem('grade4UniverseProgress')||'{}');return s&&Array.isArray(s.done)?new Set(s.done.map(String)):new Set()}catch(_){return new Set()}
  }
  function setText(sel,v){const e=qs(sel);if(e)e.textContent=String(v)}

  async function user(){try{const r=await client.auth.getUser();return r.error?null:r.data&&r.data.user||null}catch(_){return null}}

  async function loadLessons(){
    if(!client)return;
    const r=await client.from('lessons').select('*').eq('grade',GRADE);
    if(!r.error&&Array.isArray(r.data))lessons=sortLessons(r.data).slice(0,TOTAL);
  }

  async function loadProgress(u){
    if(!client||!u)return false;
    const r=await client.from('lesson_progress').select('lesson_id,completed').eq('student_id',u.id).eq('grade',GRADE).eq('completed',true);
    if(r.error)return false;
    remoteDone=new Set((r.data||[]).map(x=>String(x.lesson_id)));
    return true;
  }

  function render(){
    const done=remoteDone.size?remoteDone:localDone;
    const completed=lessons.length?lessons.filter(l=>done.has(String(l.id))).length:done.size;
    const total=lessons.length===TOTAL?TOTAL:Math.max(TOTAL,lessons.length);
    const pct=Math.min(100,Math.round(completed/TOTAL*100));
    setText('#done',completed);
    setText('#progressText',`${completed}/${TOTAL} • ${pct}%`);
    const bar=qs('#progressBar');if(bar)bar.style.width=pct+'%';

    const next=lessons.find(l=>!done.has(String(l.id)));
    if(next){
      const n=lessonNo(next), w=worldIndex(next);
      setText('#nextMission',`Next mission: L${n||'?'} • ${next.title||'Mission'} • ${worldName(w)}`);
      setText('#liveStats',`MISSION STATUS • ${completed}/${TOTAL} COMPLETE • NEXT: L${n||'?'} • ${worldName(w)}`);
    }else{
      setText('#nextMission','🎉 All 60 missions complete — Champion status unlocked');
      setText('#liveStats',`MISSION STATUS • ${TOTAL}/${TOTAL} COMPLETE • CHAMPION STATUS UNLOCKED`);
    }
    const review=qs('#review');
    if(review){review.setAttribute('aria-label',next?`Open next mission L${lessonNo(next)}`:'Review all Grade 4 missions');}
    return {completed,next};
  }

  function openNext(){
    const {next}=render();
    if(!next)return;
    const id=String(next.id);
    const card=document.querySelector(`[data-lesson-id="${CSS.escape(id)}"]`)||document.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if(card){card.scrollIntoView({behavior:'smooth',block:'center'});const b=card.querySelector('button,a');if(b)b.click();return;}
    const byNum=document.querySelector(`[data-lesson-number="${lessonNo(next)}"]`);
    if(byNum){byNum.scrollIntoView({behavior:'smooth',block:'center'});const b=byNum.querySelector('button,a');if(b)b.click();}
  }

  async function refresh(){
    if(busy)return;busy=true;
    try{
      localDone=localState();
      const u=await user();
      if(u)await loadProgress(u);
      render();
    }finally{busy=false}
  }

  async function boot(){
    if(!client)return;
    await loadLessons();
    localDone=localState();
    await refresh();
    const review=qs('#review');if(review&&!review.dataset.g4ProgressBound){review.dataset.g4ProgressBound='1';review.addEventListener('click',openNext)}
    window.addEventListener('englishMariamiGrade4SupabaseSynced',refresh);
    window.addEventListener('englishMariamiProgressUpdated',refresh);
    setInterval(refresh,3000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.ENGLISH_MARIAMI_G4_PROGRESSION={refresh,openNext};
})();
