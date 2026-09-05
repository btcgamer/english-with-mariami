/* English with Mariami — Grade 2/3 final E2E mission bridge
   Remote progress/rewards are authoritative. Legacy local state is only a migration signal.
*/
(function(){
  'use strict';
  const cfg=window.GRADE23_UNIVERSE||{};
  const grade=Number(cfg.grade||0);
  if(![2,3].includes(grade))return;
  const db=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||window.supabase;
  if(!db?.from)return;
  const KEY=grade===3?'grade3UniverseProgress':'grade2_complete_v1';
  const TOTAL=60;
  let lessons=[],busy=false,last='';
  const qs=s=>document.querySelector(s);
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const readLocal=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}};
  async function user(){try{const r=await db.auth.getUser();return r.data?.user||null}catch(_){return null}}
  async function loadLessons(){
    const r=await db.from('lessons').select('id,lesson_number,title').eq('grade',grade).gte('lesson_number',1).lte('lesson_number',TOTAL).order('lesson_number',{ascending:true});
    if(!r.error)lessons=r.data||[];
  }
  async function remoteProgress(u){
    const r=await db.from('lesson_progress').select('lesson_id,completed,score').eq('student_id',u.id).eq('grade',grade);
    return r.error?[]:(r.data||[]);
  }
  function localDone(){
    const p=readLocal(),raw=Array.isArray(p.done)?p.done:[];
    return new Set(raw.map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<TOTAL));
  }
  async function migrateDone(u,rows){
    if(!lessons.length)return;
    const remote=new Set(rows.filter(x=>x.completed).map(x=>String(x.lesson_id)));
    const done=localDone();
    for(const i of done){
      const l=lessons[i]; if(!l||remote.has(String(l.id)))continue;
      const score=grade===3?75:80;
      const lp=await db.from('lesson_progress').upsert({student_id:u.id,grade,lesson_id:String(l.id),completed:true,score,completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'student_id,grade,lesson_id'});
      if(lp.error){console.warn('[Grade '+grade+'] lesson migration failed',lp.error);continue;}
      try{await db.rpc('academy_record_activity',{p_grade:grade,p_activity_type:'lesson',p_activity_id:String(l.id),p_score:score,p_max_score:100,p_points:score>=90?40:score>=80?35:30})}catch(e){console.warn('[Grade '+grade+'] reward migration failed',e)}
    }
  }
  async function refresh(){
    if(busy)return; busy=true;
    try{
      const u=await user(); if(!u)return;
      if(!lessons.length)await loadLessons();
      let rows=await remoteProgress(u);
      await migrateDone(u,rows);
      rows=await remoteProgress(u);
      const done=rows.filter(x=>x.completed&&lessons.some(l=>String(l.id)===String(x.lesson_id))).length;
      const rs=await db.from('academy_reward_state').select('xp,stars,lessons_completed').eq('student_id',u.id).maybeSingle();
      const st=await db.from('academy_streaks').select('current_streak').eq('student_id',u.id).maybeSingle();
      const reward=rs.data||{},streak=st.data||{};
      const xp=num(reward.xp),stars=num(reward.stars),fire=num(streak.current_streak);
      const pct=Math.round(done/TOTAL*100);
      ['xp','xpValue'].forEach(id=>{const e=qs('#'+id);if(e)e.textContent=xp});
      ['stars','starValue'].forEach(id=>{const e=qs('#'+id);if(e)e.textContent=stars});
      ['streak','streakValue'].forEach(id=>{const e=qs('#'+id);if(e)e.textContent=fire});
      const d=qs('#done');if(d)d.textContent=done;
      const pt=qs('#progressText');if(pt)pt.textContent=grade===3?done+'/'+TOTAL+' • '+pct+'%':pct+'%';
      const bar=qs('#progressBar');if(bar)bar.style.width=pct+'%';
      const state={grade,xp,stars,streak:fire,completed:done,total:TOTAL,next:lessons.find(l=>!rows.some(r=>r.completed&&String(r.lesson_id)===String(l.id)))||null};
      const fp=JSON.stringify(state);if(fp!==last){last=fp;window.__ACADEMY_G23_E2E_STATE__=state;window.dispatchEvent(new CustomEvent('englishMariamiGrade23E2E',{detail:state}))}
    }catch(e){console.warn('[Grade '+grade+' E2E]',e)}finally{busy=false}
  }
  function installGrade2Completion(){
    if(grade!==2)return;
    const modal=qs('#modalContent'); if(!modal)return;
    const quiz=modal.querySelectorAll('.quiz-card');
    if(!quiz.length)return;
    const answered=[...quiz].every(q=>[...q.querySelectorAll('[data-quiz-answer]')].some(b=>b.disabled));
    if(!answered)return;
    const correct=[...quiz].filter(q=>q.querySelector('.quiz-correct')).length;
    const score=Math.round(correct/quiz.length*100);
    let btn=modal.querySelector('[data-e2e-complete]');
    if(!btn){btn=document.createElement('button');btn.type='button';btn.dataset.e2eComplete='1';btn.style.cssText='display:block;width:100%;margin:22px 0;padding:14px;border:1px solid #00eaff;border-radius:14px;background:linear-gradient(135deg,#00eaff,#8b5cff);color:#00131a;font-weight:900;cursor:pointer';modal.appendChild(btn)}
    const lessonText=(modal.querySelector('.mission')?.textContent||'').match(/\b(\d{1,2})\b/);const n=lessonText?Number(lessonText[1]):0;
    btn.textContent=score>=75?'✓ COMPLETE MISSION • '+score+'%':'🔒 REACH 75% TO COMPLETE';btn.disabled=score<75||!n;
    if(!btn.dataset.bound){btn.dataset.bound='1';btn.onclick=async()=>{if(btn.disabled)return;const p=readLocal(),done=Array.isArray(p.done)?p.done.map(Number):[];const idx=n-1;if(!done.includes(idx)){done.push(idx);done.sort((a,b)=>a-b);p.done=done;try{localStorage.setItem(KEY,JSON.stringify(p))}catch(_){} }await refresh();btn.textContent='✓ MISSION SAVED';btn.disabled=true;setTimeout(()=>{qs('#closeModal')?.click();refresh()},350)}};
  }
  function boot(){refresh();setInterval(refresh,3000);setInterval(installGrade2Completion,500);window.addEventListener('englishMariamiProgressUpdated',refresh);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.__ACADEMY_G23_E2E__={refresh};
})();
