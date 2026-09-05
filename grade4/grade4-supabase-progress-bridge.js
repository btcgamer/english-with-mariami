/* English with Mariami — Grade 4 Supabase progress bridge
   Transition layer: mirrors Grade 4 lesson completion, quiz rewards and streak
   into the existing RLS-protected Supabase progress tables.
   The legacy local state remains temporarily for backward compatibility; the
   next cleanup pass can remove it after this bridge has been verified.
*/
(function(){
  'use strict';
  const GRADE=4;
  const KEY='grade4UniverseProgress';
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client)return;
  let lastFingerprint='';
  let syncing=false;

  const readState=()=>{
    try{
      const raw=localStorage.getItem(KEY);
      const state=raw?JSON.parse(raw):{};
      return {
        done:Array.isArray(state.done)?[...new Set(state.done.map(String))]:[],
        xp:Number(state.xp)||0,
        stars:Number(state.stars)||0,
        streak:Number(state.streak)||0,
        quizRewards:state.quizRewards&&typeof state.quizRewards==='object'?state.quizRewards:{},
        quizPassed:state.quizPassed&&typeof state.quizPassed==='object'?state.quizPassed:{}
      };
    }catch(_){return {done:[],xp:0,stars:0,streak:0,quizRewards:{},quizPassed:{}};}
  };

  async function user(){
    try{
      const {data,error}=await client.auth.getUser();
      return error?null:data?.user||null;
    }catch(_){return null;}
  }

  async function sync(){
    if(syncing)return;
    const state=readState();
    const fp=JSON.stringify(state);
    if(fp===lastFingerprint)return;
    const u=await user();
    if(!u)return;
    syncing=true;
    try{
      const now=new Date().toISOString();
      const lessonRows=state.done.map(lessonId=>({
        student_id:u.id,
        grade:GRADE,
        lesson_id:String(lessonId),
        completed:true,
        score:100,
        completed_at:now,
        updated_at:now
      }));
      if(lessonRows.length){
        const {error}=await client.from('lesson_progress').upsert(lessonRows,{onConflict:'student_id,grade,lesson_id'});
        if(error)throw error;
      }

      const rewardIds=Object.keys(state.quizRewards||{}).filter(k=>state.quizRewards[k]);
      if(rewardIds.length){
        const rows=rewardIds.map(k=>{
          const parts=String(k).split('-');
          const index=parts.length>1?parts.pop():'0';
          const quizId=parts.join('-');
          return {student_id:u.id,grade:GRADE,quiz_id:String(quizId),question_id:`q-${index}`};
        });
        const {error}=await client.from('student_question_scores').upsert(rows,{onConflict:'student_id,quiz_id,question_id'});
        if(error)console.warn('[G4 Supabase Bridge] quiz reward sync skipped:',error);
      }

      const {error:streakError}=await client.from('academy_streaks').upsert({
        student_id:u.id,
        current_streak:Math.max(0,state.streak),
        best_streak:Math.max(0,state.streak),
        last_active_date:new Date().toISOString().slice(0,10),
        updated_at:now
      },{onConflict:'student_id'});
      if(streakError)console.warn('[G4 Supabase Bridge] streak sync skipped:',streakError);

      lastFingerprint=fp;
      window.dispatchEvent(new CustomEvent('englishMariamiGrade4SupabaseSynced',{detail:{done:state.done.length,xp:state.xp,stars:state.stars,streak:state.streak}}));
    }catch(error){
      console.warn('[G4 Supabase Bridge] sync error:',error);
    }finally{syncing=false;}
  }

  function boot(){
    sync();
    setInterval(sync,1800);
    window.addEventListener('englishMariamiProgressUpdated',sync);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.ENGLISH_MARIAMI_G4_SUPABASE_BRIDGE={sync};
})();
