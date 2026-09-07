/* English with Mariami — Grade 2/3 Supabase progress bridge */
(function(){
  'use strict';
  const grade=Number(document.body?.dataset?.grade||window.GRADE23_UNIVERSE?.grade||0);
  if(![2,3].includes(grade))return;
  const stateKey=`magic-neon-grade-${grade}`;
  let client=null,saving=false,restoring=true,dirty=false;

  function getState(){
    try{
      const raw=JSON.parse(localStorage.getItem(stateKey)||'null');
      return raw&&typeof raw==='object'?{...raw,done:Array.isArray(raw.done)?raw.done:[]}:null;
    }catch(_){return null}
  }
  function setState(state){try{localStorage.setItem(stateKey,JSON.stringify(state))}catch(_){}
  }
  async function getUser(){
    try{
      if(!client)return null;
      const r=await client.auth.getUser();
      return r.data?.user||null;
    }catch(_){return null}
  }
  async function restore(){
    const u=await getUser();
    if(!u){restoring=false;return}
    try{
      const r=await client.from('student_progress').select('words_learned,quiz_completed,quiz_attempts,learned_words,score,best_quiz').eq('user_id',u.id).eq('grade',grade).maybeSingle();
      if(r.error)throw r.error;
      const row=r.data;
      const local=getState()||{current:1,done:[],stars:0,streak:0};
      const localDone=new Set(local.done.map(String));
      const remoteDone=Array.isArray(row?.learned_words)?row.learned_words.map(String).filter(Boolean):[];
      const mergedDone=new Set(remoteDone);
      localDone.forEach(id=>mergedDone.add(id));
      const merged=[...mergedDone];
      const remoteCount=Math.max(Number(row?.words_learned)||0,remoteDone.length);
      const mergedQuiz=Math.max(Number(local.quizAttempts)||0,Number(row?.quiz_attempts)||0,Number(row?.quiz_completed)||0);
      const mergedBest=Math.max(Number(local.bestScore)||0,Number(row?.best_quiz)||0,Number(row?.score)||0);
      local.done=merged;
      if(mergedQuiz>0)local.quizAttempts=mergedQuiz;
      if(mergedBest>0)local.bestScore=mergedBest;
      setState(local);
      dirty=merged.length!==remoteCount||mergedQuiz>Math.max(Number(row?.quiz_attempts)||0,Number(row?.quiz_completed)||0)||mergedBest>Math.max(Number(row?.best_quiz)||0,Number(row?.score)||0);
      if(remoteDone.length===0&&remoteCount>0)dirty=false;
    }catch(e){console.warn('Grade '+grade+' progress restore error:',e)}
    finally{restoring=false;if(dirty)save()}
  }
  async function save(){
    if(saving||restoring||!dirty||!client)return;
    const u=await getUser();if(!u)return;
    const state=getState()||{current:1,done:[],stars:0,streak:0};
    const done=[...new Set((state.done||[]).map(String).filter(Boolean))];
    const percent=Math.round(done.length/60*100);
    saving=true;
    const now=new Date().toISOString();
    const payload={user_id:u.id,grade,words_learned:done.length,quiz_completed:done.length,quiz_attempts:done.length,score:percent,best_quiz:percent,learned_words:done,last_active_at:now,updated_at:now};
    try{
      const r=await client.from('student_progress').upsert(payload,{onConflict:'user_id,grade'});
      if(!r.error)dirty=false;else console.warn('Grade '+grade+' progress sync error:',r.error);
    }catch(e){console.warn('Grade '+grade+' progress sync error:',e)}
    finally{saving=false}
  }
  function markDirty(){if(!restoring){dirty=true;save()}}

  function boot(){
    client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null;
    if(!client)return;
    restore();
    document.addEventListener('click',function(e){
      const mission=e.target.closest('[data-next],[data-complete],[data-mission-complete]');
      if(mission)markDirty();
      const world=e.target.closest('[data-m]');
      if(world)markDirty();
    },true);
    window.addEventListener('storage',function(e){if(e.key===stateKey)markDirty()});
    setInterval(()=>{if(getState())markDirty()},5000);
    window.addEventListener('beforeunload',()=>{if(dirty)save()});
  }
  if(window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient)boot();
  else window.addEventListener('englishMariamiSupabaseReady',boot,{once:true});
})();
