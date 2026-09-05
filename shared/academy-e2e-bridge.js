/* MAGIC NEON AI ACADEMY — shared E2E completion bridge
   Makes lesson completion authoritative in Supabase for Grades 2–4.
*/
(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase();
  const m=path.match(/\/grade([234])\//);
  if(!m)return;
  const GRADE=Number(m[1]);
  const db=()=>window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||window.supabase;
  const TOTAL=60;
  let busy=false;
  async function getUser(){try{const r=await db()?.auth.getUser();return r?.data?.user||null}catch(_){return null}}
  async function lessonIdFor(number){
    const n=Number(number); if(!n)return null;
    try{const r=await db().from('lessons').select('id').eq('grade',GRADE).eq('lesson_number',n).maybeSingle();return r.error?null:r.data?.id||null}catch(_){return null}
  }
  async function complete(number,score){
    if(busy)return false; busy=true;
    try{
      const client=db(); if(!client?.from||!client?.rpc)return false;
      const u=await getUser(); if(!u)return false;
      const lid=await lessonIdFor(number); if(!lid)return false;
      const pct=Math.max(0,Math.min(100,Number(score)||0));
      const lp=await client.from('lesson_progress').upsert({student_id:u.id,grade:GRADE,lesson_id:String(lid),completed:true,score:Math.round(pct),completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'student_id,grade,lesson_id'});
      if(lp.error)throw lp.error;
      const points=pct>=90?40:pct>=80?35:30;
      const rr=await client.rpc('academy_record_activity',{p_grade:GRADE,p_activity_type:'lesson',p_activity_id:'grade'+GRADE+'-lesson-'+number,p_score:Math.round(pct),p_max_score:100,p_points:points});
      if(rr.error)throw rr.error;
      window.dispatchEvent(new CustomEvent('academyLessonCompleted',{detail:{grade:GRADE,lessonNumber:Number(number),lessonId:String(lid),score:pct,reward:rr.data}}));
      return true;
    }catch(e){console.warn('[Academy E2E Bridge]',e);return false}
    finally{busy=false}
  }
  function g2(){
    if(GRADE!==2)return;
    document.addEventListener('click',function(e){
      const quiz=e.target.closest('[data-quiz-answer]'); if(!quiz)return;
      setTimeout(()=>{
        const cards=[...document.querySelectorAll('#modal .quiz-card')];
        if(!cards.length||cards.some(c=>!c.querySelector('[data-quiz-answer]:disabled')))return;
        const correct=cards.filter(c=>c.querySelector('.quiz-correct')).length;
        const pct=Math.round(correct/cards.length*100);
        const modal=document.querySelector('#modalContent'); if(!modal)return;
        let b=modal.querySelector('#academyG2Complete');
        if(!b){b=document.createElement('button');b.id='academyG2Complete';b.className='g3-complete';b.type='button';modal.appendChild(b)}
        b.disabled=pct<75;b.textContent=pct>=75?'✓ COMPLETE MISSION ('+pct+'%)':'🔒 COMPLETE MISSION — '+pct+'%';
        if(!b.dataset.bound){b.dataset.bound='1';b.onclick=async()=>{if(b.disabled)return;const mission=document.querySelector('#modalContent .mission')?.textContent||'';const mm=mission.match(/\b(\d{1,2})\b/);const n=mm?Number(mm[1]):0;if(await complete(n,pct)){b.textContent='✓ MISSION COMPLETED';b.disabled=true;setTimeout(()=>location.reload(),250)}}}
      },30);
    },true);
  }
  function g3(){
    if(GRADE!==3)return;
    document.addEventListener('click',function(e){
      const b=e.target.closest('.g3-complete'); if(!b)return;
      const dialog=b.closest('.g3-vocab-dialog');
      const num=(dialog?.querySelector('.num')?.textContent||'').match(/MISSION\s+(\d+)/i);
      const score=(dialog?.querySelector('[data-result]')?.textContent||'').match(/\((\d+)%\)/);
      if(!num)return;
      e.preventDefault(); e.stopImmediatePropagation();
      complete(Number(num[1]),score?Number(score[1]):75).then(ok=>{if(ok){b.textContent='✓ MISSION COMPLETED';b.disabled=true;setTimeout(()=>{dialog?.parentElement?.remove()},180)}});
    },true);
  }
  function refreshLocal(){
    if(GRADE===2){try{const p=JSON.parse(localStorage.getItem('grade2_complete_v1')||'{}');if(Array.isArray(p.done)){window.dispatchEvent(new CustomEvent('academyRemoteCompletion',{detail:p.done.length}))}}catch(_){}
    }
  }
  function boot(){if(GRADE===2)g2();if(GRADE===3)g3();refreshLocal();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.__ACADEMY_E2E__={complete,refreshLocal};
})();
