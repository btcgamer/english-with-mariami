/* English with Mariami — Grade 4 legacy-progress migration bridge */
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
      return {done:[...new Set(arr(s.done).map(String))]};
    }catch(_){return {done:[]};}
  }
  async function getUser(){try{const r=await client.auth.getUser();return r.error?null:r.data?.user||null}catch(_){return null}}
  async function sync(){
    if(syncing)return;
    const s=read(), fp=JSON.stringify(s); if(fp===lastFingerprint)return;
    const u=await getUser(); if(!u)return;
    syncing=true;
    try{
      // Supabase is authoritative. Only migrate legacy local lesson completion
      // when the server has no completed Grade 4 rows yet; never overwrite
      // server rewards, XP, stars, or streaks from stale localStorage values.
      const remote=await client.from('lesson_progress')
        .select('lesson_id,completed')
        .eq('student_id',u.id)
        .eq('grade',GRADE)
        .eq('completed',true);
      if(remote.error)throw remote.error;
      const remoteDone=new Set((remote.data||[]).map(x=>String(x.lesson_id)));
      if(!remoteDone.size&&s.done.length){
        const now=new Date().toISOString();
        const rows=s.done.map(id=>({
          student_id:u.id,grade:GRADE,lesson_id:id,completed:true,
          score:100,completed_at:now,updated_at:now
        }));
        const r=await client.from('lesson_progress').upsert(rows,{onConflict:'student_id,grade,lesson_id'});
        if(r.error)throw r.error;
      }
      lastFingerprint=fp;
      window.dispatchEvent(new CustomEvent('englishMariamiGrade4SupabaseSynced',{detail:{completed:remoteDone.size||s.done.length,migrated:!remoteDone.size&&s.done.length>0}}));
    }catch(e){console.warn('[G4] legacy progress migration failed:',e)}finally{syncing=false}
  }
  function boot(){sync();setInterval(sync,1800);window.addEventListener('englishMariamiProgressUpdated',sync)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.ENGLISH_MARIAMI_G4_SUPABASE_BRIDGE={sync};
})();
