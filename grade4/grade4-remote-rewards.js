/* English with Mariami — Grade 4 remote-authoritative rewards */
(function(){
  'use strict';
  const GRADE=4, TOTAL=60, client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client)return;
  let busy=false,last='';
  const qs=s=>document.querySelector(s);
  const esc=v=>String(v==null?'':v);
  async function user(){try{const r=await client.auth.getUser();return r.error?null:r.data&&r.data.user||null}catch(_){return null}}
  function lessonList(){
    const ls=Array.isArray(window.__GRADE4_LESSONS)?window.__GRADE4_LESSONS:[];
    if(ls.length)return ls.slice().sort((a,b)=>(+a.lesson_number||0)- (+b.lesson_number||0));
    return [];
  }
  async function refresh(){
    if(busy)return; busy=true;
    try{
      const u=await user(); if(!u)return;
      const [lp,rs,st]=await Promise.all([
        client.from('lesson_progress').select('lesson_id,completed,score,updated_at').eq('student_id',u.id).eq('grade',GRADE),
        client.from('academy_reward_state').select('xp,stars,lessons_completed').eq('student_id',u.id).maybeSingle(),
        client.from('academy_streaks').select('current_streak,best_streak,last_active_date').eq('student_id',u.id).maybeSingle()
      ]);
      if(lp.error)throw lp.error;
      const rows=lp.data||[], doneIds=new Set(rows.filter(x=>x.completed).map(x=>esc(x.lesson_id)));
      const lessons=lessonList(), validIds=new Set(lessons.map(x=>esc(x.id)));
      const completed=lessons.length?lessons.filter(x=>doneIds.has(esc(x.id))).length:Math.min(TOTAL,doneIds.size);
      const reward=rs.data||{}, streak=st.data||{};
      const xp=Math.max(0,+reward.xp||0), stars=Math.max(0,+reward.stars||0), fire=Math.max(0,+streak.current_streak||0);
      const pct=Math.min(100,Math.round(completed/TOTAL*100));
      const next=lessons.find(x=>!doneIds.has(esc(x.id)));
      const nextNo=next?Number(next.lesson_number||0):0;
      const world=nextNo?Math.floor((nextNo-1)/10)+1:6;
      const status=qs('#done'), xpEl=qs('#xp'), starsEl=qs('#stars'), streakEl=qs('#streak'), pt=qs('#progressText'), bar=qs('#progressBar'), nm=qs('#nextMission'), live=qs('#liveStats');
      if(status)status.textContent=completed;
      if(xpEl)xpEl.textContent=xp;
      if(starsEl)starsEl.textContent=stars;
      if(streakEl)streakEl.textContent=fire;
      if(pt)pt.textContent=completed+'/'+TOTAL+' • '+pct+'%';
      if(bar)bar.style.width=pct+'%';
      if(nm)nm.textContent=next?'Next mission: World '+world+' • '+esc(next.title||('Mission '+nextNo)):'🎉 Universe complete — 60/60 Champion';
      if(live)live.textContent='LIVE SYNC • '+completed+'/'+TOTAL+' missions • '+xp+' XP • '+stars+' ⭐ • '+fire+' 🔥';
      window.ENGLISH_MARIAMI_G4_REMOTE_STATE={xp,stars,streak:fire,completed,total:TOTAL,nextLesson:next||null,world};
      const fp=JSON.stringify({xp,stars,fire,completed,next:next&&next.id});
      if(fp!==last){last=fp;window.dispatchEvent(new CustomEvent('englishMariamiGrade4RemoteState',{detail:window.ENGLISH_MARIAMI_G4_REMOTE_STATE}));}
      const review=qs('#review');
      if(review&&!review.dataset.remoteBound){
        review.dataset.remoteBound='1';
        review.addEventListener('click',function(){
          const target=next&&next.id;
          if(target){
            const card=document.querySelector('[data-lesson-id="'+CSS.escape(esc(target))+'"]');
            if(card){card.scrollIntoView({behavior:'smooth',block:'center'});const b=card.querySelector('button,a');if(b)setTimeout(()=>b.click(),250);return;}
          }
          const m=qs('#missions'); if(m)m.scrollIntoView({behavior:'smooth',block:'start'});
        },true);
      }
      if(completed===TOTAL&&review)review.textContent='🏆 60/60 • CHAMPION STATUS';
    }catch(e){console.warn('[G4] remote rewards:',e)}finally{busy=false}
  }
  function boot(){refresh();setInterval(refresh,2500);window.addEventListener('englishMariamiGrade4SupabaseSynced',refresh);window.addEventListener('englishMariamiProgressUpdated',refresh);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.ENGLISH_MARIAMI_G4_REMOTE_REWARDS={refresh};
})();
