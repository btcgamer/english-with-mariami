/* English with Mariami — Grade 4 Supabase progress sync bridge */
(function(){
  'use strict';
  const GRADE=4;
  const KEY='magic-neon-grade-4';
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client)return;

  let busy=false;
  let restored=false;

  function readLocal(){
    try{
      const value=JSON.parse(localStorage.getItem(KEY)||'null');
      return value&&typeof value==='object'?value:{current:1,done:[],stars:0,streak:0};
    }catch(_){
      return {current:1,done:[],stars:0,streak:0};
    }
  }

  function normalizeDone(value){
    return Array.isArray(value)
      ? [...new Set(value.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=60))].sort((a,b)=>a-b)
      : [];
  }

  function writeLocal(state){
    try{localStorage.setItem(KEY,JSON.stringify(state))}catch(_){ }
  }

  async function getUser(){
    try{
      const r=await client.auth.getUser();
      return r.data&&r.data.user?r.data.user:null;
    }catch(_){return null}
  }

  async function restore(){
    if(restored)return;
    const user=await getUser();
    if(!user){restored=true;return;}
    try{
      const r=await client.from('student_progress')
        .select('words_learned,quiz_completed,score,learned_words,best_quiz,quiz_attempts')
        .eq('user_id',user.id)
        .eq('grade',GRADE)
        .maybeSingle();
      if(r.error)throw r.error;

      const local=readLocal();
      const localDone=normalizeDone(local.done);
      let remoteDone=[];
      if(r.data&&Array.isArray(r.data.learned_words))remoteDone=normalizeDone(r.data.learned_words);

      const merged=[...new Set([...localDone,...remoteDone])].sort((a,b)=>a-b);
      const remoteCount=Math.max(0,Math.min(60,Number(r.data&&r.data.words_learned)||0));

      /* Older Grade 4 records may only contain a count. Do not invent mission IDs.
         Keep the local mission list authoritative until concrete IDs exist remotely. */
      if(merged.length>localDone.length){
        local.done=merged;
        writeLocal(local);
        location.reload();
        return;
      }

      if(r.data&&remoteCount>localDone.length&&remoteDone.length===0){
        /* Count-only legacy data cannot safely map to exact missions. */
        console.info('Grade 4 progress sync: legacy count detected; exact local missions preserved.');
      }

      restored=true;
      sync();
    }catch(error){
      console.warn('Grade 4 progress restore error:',error);
      restored=true;
    }
  }

  async function sync(){
    if(busy)return;
    const user=await getUser();
    if(!user)return;
    busy=true;
    try{
      const state=readLocal();
      const done=normalizeDone(state.done);
      const percent=Math.round(done.length/60*100);
      const now=new Date().toISOString();
      const payload={
        user_id:user.id,
        grade:GRADE,
        words_learned:done.length,
        quiz_completed:done.length,
        score:percent,
        best_quiz:percent,
        quiz_attempts:done.length,
        learned_words:done,
        last_active_at:now,
        updated_at:now
      };
      const r=await client.from('student_progress').upsert(payload,{onConflict:'user_id,grade'});
      if(r.error)throw r.error;
    }catch(error){
      console.warn('Grade 4 progress sync error:',error);
    }finally{busy=false}
  }

  let last='';
  function watch(){
    const state=readLocal();
    const done=normalizeDone(state.done);
    const signature=JSON.stringify({done,stars:Number(state.stars)||0,streak:Number(state.streak)||0});
    if(signature!==last){
      last=signature;
      if(restored)sync();
    }
  }

  client.auth.onAuthStateChange(function(event){
    if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED')setTimeout(restore,0);
  });

  restore();
  watch();
  setInterval(watch,2000);
  window.addEventListener('beforeunload',sync);
})();
