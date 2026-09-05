/* English with Mariami — Grade 4 legacy-progress migration bridge */
(function(){
  'use strict';
  const GRADE=4, KEY='grade4UniverseProgress';
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client)return;
  let lastFingerprint='', syncing=false;
  const arr=v=>Array.isArray(v)?v:[];
  const text=v=>String(v==null?'':v);
  function read(){
    try{
      const s=JSON.parse(localStorage.getItem(KEY)||'{}');
      return {done:[...new Set(arr(s.done).map(text).filter(Boolean))]};
    }catch(_){return {done:[]};}
  }
  async function getUser(){try{const r=await client.auth.getUser();return r.error?null:r.data?.user||null}catch(_){return null}}
  async function sync(){
    if(syncing)return;
    const s=read(), fp=JSON.stringify(s); if(fp===lastFingerprint)return;
    const u=await getUser(); if(!u)return;
    syncing=true;
    try{
      // Supabase is authoritative. Legacy local completion is migrated only
      // for an empty Grade 4 server state. Local IDs may be UUIDs OR old
      // numeric lesson numbers, so resolve both before writing progress.
      // Never write reward_state/streak from local data.
      const remote=await client.from('lesson_progress')
        .select('lesson_id,completed')
        .eq('student_id',u.id)
        .eq('grade',GRADE)
        .eq('completed',true);
      if(remote.error)throw remote.error;
      const remoteDone=new Set((remote.data||[]).map(x=>text(x.lesson_id)));
      let migrated=false;
      if(!remoteDone.size&&s.done.length){
        const lessons=await client.from('lessons')
          .select('id,lesson_number')
          .eq('grade',GRADE)
          .order('lesson_number',{ascending:true});
        if(lessons.error)throw lessons.error;
        const byId=new Map((lessons.data||[]).map(l=>[text(l.id),l]));
        const byNumber=new Map((lessons.data||[]).map(l=>[String(Number(l.lesson_number)),l]));
        const resolved=[];
        for(const token of s.done){
          const lesson=byId.get(token)||byNumber.get(String(Number(token)));
          if(lesson)resolved.push(lesson);
        }
        const unique=[...new Map(resolved.map(l=>[text(l.id),l])).values()];
        if(unique.length){
          const now=new Date().toISOString();
          const rows=unique.map(l=>({
            student_id:u.id,grade:GRADE,lesson_id:l.id,completed:true,
            score:100,completed_at:now,updated_at:now
          }));
          const r=await client.from('lesson_progress').upsert(rows,{onConflict:'student_id,grade,lesson_id'});
          if(r.error)throw r.error;
          migrated=true;
        }
      }
      lastFingerprint=fp;
      window.dispatchEvent(new CustomEvent('englishMariamiGrade4SupabaseSynced',{detail:{completed:remoteDone.size||s.done.length,migrated}}));
    }catch(e){console.warn('[G4] legacy progress migration failed:',e)}finally{syncing=false}
  }
  function boot(){
    if(window.__EWM_G4_BRIDGE_BOOTED)return;
    window.__EWM_G4_BRIDGE_BOOTED=true;
    sync();setInterval(sync,1800);window.addEventListener('englishMariamiProgressUpdated',sync);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.ENGLISH_MARIAMI_G4_SUPABASE_BRIDGE={sync};
})();
