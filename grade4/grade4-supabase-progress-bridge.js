/* English with Mariami — Grade 4 Supabase-first reward bridge */
(function(){
  'use strict';
  const GRADE=4, KEY='grade4UniverseProgress';
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client)return;
  let lastFingerprint='', syncing=false;
  const arr=v=>Array.isArray(v)?v:[];
  function read(){
    try{
      const s=JSON.parse(localStorage.getItem(KEY)||'{}');
      return {done:[...new Set(arr(s.done).map(String))],xp:+s.xp||0,stars:+s.stars||0,streak:+s.streak||0,quizRewards:s.quizRewards&&typeof s.quizRewards==='object'?s.quizRewards:{}};
    }catch(_){return {done:[],xp:0,stars:0,streak:0,quizRewards:{}};}
  }
  async function getUser(){try{const r=await client.auth.getUser();return r.error?null:r.data?.user||null}catch(_){return null}}
  async function sync(){
    if(syncing)return;
    const s=read(), fp=JSON.stringify(s); if(fp===lastFingerprint)return;
    const u=await getUser(); if(!u)return;
    syncing=true;
    try{
      const now=new Date().toISOString();
      if(s.done.length){
        const rows=s.done.map(id=>({student_id:u.id,grade:GRADE,lesson_id:id,completed:true,score:100,completed_at:now,updated_at:now}));
        const r=await client.from('lesson_progress').upsert(rows,{onConflict:'student_id,grade,lesson_id'}); if(r.error)throw r.error;
      }
      const reward={student_id:u.id,xp:s.xp,stars:s.stars,lessons_completed:s.done.length,updated_at:now};
      const rr=await client.from('academy_reward_state').upsert(reward,{onConflict:'student_id'}); if(rr.error)throw rr.error;
      const sr=await client.from('academy_streaks').upsert({student_id:u.id,current_streak:s.streak,best_streak:s.streak,last_active_date:new Date().toISOString().slice(0,10),updated_at:now},{onConflict:'student_id'});
      if(sr.error)console.warn('[G4] streak sync:',sr.error);
      lastFingerprint=fp;
      window.dispatchEvent(new CustomEvent('englishMariamiGrade4SupabaseSynced',{detail:{xp:s.xp,stars:s.stars,streak:s.streak,completed:s.done.length}}));
    }catch(e){console.warn('[G4] Supabase reward sync failed:',e)}finally{syncing=false}
  }
  function boot(){sync();setInterval(sync,1800);window.addEventListener('englishMariamiProgressUpdated',sync)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.ENGLISH_MARIAMI_G4_SUPABASE_BRIDGE={sync};
})();
