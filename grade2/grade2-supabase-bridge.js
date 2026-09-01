/* Grade 2 — safe Supabase bridge: local-first game + student_progress sync. */
(function(){
  'use strict';
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||window.supabase;
  const KEY='grade2_complete_v1';
  if(!client)return;
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{"xp":0,"stars":0,"done":[],"daily":""}')}catch(_){return {xp:0,stars:0,done:[],daily:''}}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){} };
  const badge=msg=>{const e=document.getElementById('grade2SyncBadge');if(e)e.textContent=msg};
  async function getUser(){const r=await client.auth.getUser();return r.error?null:r.data?.user||null}
  async function checkGrade(u){const r=await client.from('profiles').select('role,grade').eq('user_id',u.id).maybeSingle();if(r.error||!r.data)return true;const role=String(r.data.role||'').toLowerCase(),g=Number(r.data.grade||0);if(role==='student'&&[2,3,4].includes(g)&&g!==2){location.replace('../grade'+g+'.html');return false}return true}
  async function restore(u){const r=await client.from('student_progress').select('words_learned,quiz_completed,best_quiz,learned_words').eq('user_id',u.id).eq('grade',2).maybeSingle();if(r.error||!r.data)return;const p=read();const has=Array.isArray(p.done)&&p.done.length||Number(p.xp)||Number(p.stars);if(!has&&(Number(r.data.words_learned)||Number(r.data.quiz_completed))){const learned=Array.isArray(r.data.learned_words)?r.data.learned_words:[];const n=Math.min(12,Math.max(Math.round(Number(r.data.words_learned||0)/25),learned.length));p.done=Array.from({length:n},(_,i)=>i);p.xp=Math.max(Number(r.data.words_learned||0),Number(r.data.best_quiz||0));p.stars=Number(r.data.quiz_completed||0);write(p);location.reload()}}
  async function save(u){const p=read(),done=Array.isArray(p.done)?p.done:[];const words=Math.min(300,done.length*25+Math.min(25,Number(p.xp||0)%100));const quiz=Math.max(0,Number(p.stars||0));const best=done.length===12?100:Math.min(100,Number(p.xp||0)%100);const now=new Date().toISOString();const r=await client.from('student_progress').upsert({user_id:u.id,grade:2,words_learned:words,quiz_completed:quiz,score:best,learned_words:done.map(i=>'grade2-mission-'+(Number(i)+1)),best_quiz:best,quiz_attempts:Number(p.quizAttempts||0),last_active_at:now,updated_at:now},{onConflict:'user_id,grade'});badge(r.error?'⚠ Local progress safe':'✓ Supabase synced')}
  (async()=>{try{const u=await getUser();if(!u){location.replace('../login.html?redirect='+encodeURIComponent('grade2/index.html'));return}if(!(await checkGrade(u)))return;await restore(u);await save(u);let last=localStorage.getItem(KEY)||'';setInterval(async()=>{const now=localStorage.getItem(KEY)||'';if(now!==last){last=now;await save(u)}},2000)}catch(e){console.warn('[Grade2 Bridge]',e);badge('⚠ Local mode')}})();
})();
