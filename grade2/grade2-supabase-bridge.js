/* Grade 2 — safe Supabase bridge: local-first game + student_progress sync. */
(function(){
'use strict';
const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||window.supabase;
const KEY='grade2_complete_v1';
const LEGACY_KEY='grade2_neon_progress_v3';
if(!client)return;
function migrateLegacy(){try{const current=localStorage.getItem(KEY),legacy=localStorage.getItem(LEGACY_KEY);if(!current&&legacy)localStorage.setItem(KEY,legacy)}catch(_){} }
migrateLegacy();
const defaults={xp:0,stars:0,done:[],daily:'',words:[]};
const read=()=>{try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(_){return {...defaults}}};
const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){} };
const badge=msg=>{const e=document.getElementById('grade2SyncBadge');if(e)e.textContent=msg};
async function getUser(){const r=await client.auth.getUser();return r.error?null:r.data?.user||null}
async function checkGrade(u){const r=await client.from('profiles').select('role,grade').eq('user_id',u.id).maybeSingle();if(r.error||!r.data)return true;const role=String(r.data.role||'').toLowerCase(),g=Number(r.data.grade||0);if(role==='student'&&[2,3,4].includes(g)&&g!==2){location.replace('../grade'+g+'/index.html');return false}return true}
function missionIds(list){return (Array.isArray(list)?list:[]).map(String).filter(x=>/^grade2-mission-\d+$/.test(x));}
async function restore(u){
  const r=await client.from('student_progress').select('words_learned,quiz_completed,best_quiz,score,learned_words,quiz_attempts').eq('user_id',u.id).eq('grade',2).maybeSingle();
  if(r.error||!r.data)return;
  const remote=r.data,p=read();
  const remoteIds=missionIds(remote.learned_words);
  const localDone=Array.isArray(p.done)?p.done.map(Number).filter(Number.isInteger):[];
  const remoteDone=remoteIds.map(x=>Number(x.replace('grade2-mission-',''))-1).filter(i=>i>=0&&i<12);
  const mergedDone=[...new Set([...localDone,...remoteDone])].sort((a,b)=>a-b);
  const localWords=Array.isArray(p.words)?p.words.map(String):[];
  const remoteWords=Array.isArray(remote.learned_words)?remote.learned_words.map(String):[];
  const mergedWords=[...new Set([...localWords,...remoteWords])];
  const localXp=Number(p.xp)||0,remoteXp=Number(remote.words_learned)||0;
  const localStars=Number(p.stars)||0,remoteStars=Number(remote.quiz_completed)||0;
  const localBest=Math.max(0,Number(p.xp)||0)%100;
  const remoteBest=Math.max(Number(remote.best_quiz)||0,Number(remote.score)||0);
  const merged={...p,done:mergedDone,words:mergedWords,xp:Math.max(localXp,remoteXp),stars:Math.max(localStars,remoteStars)};
  if(!Array.isArray(p.done)||mergedDone.length!==localDone.length||merged.xp!==localXp||merged.stars!==localStars||mergedWords.length!==localWords.length)write(merged);
}
async function save(u){
  const p=read(),done=Array.isArray(p.done)?p.done.map(Number).filter(Number.isInteger):[];
  const learned=Array.isArray(p.words)?p.words.map(String):[];
  const words=Math.min(300,Math.max(done.length*25,learned.length,Number(p.xp||0)));
  const quiz=Math.max(0,Number(p.stars||0));
  const best=Math.max(0,Math.min(100,Number(p.bestQuiz||0),Number(p.xp||0)%100));
  const now=new Date().toISOString();
  const ids=[...new Set([...learned,...done.map(i=>'grade2-mission-'+(i+1))])];
  const r=await client.from('student_progress').upsert({user_id:u.id,grade:2,words_learned:words,quiz_completed:quiz,score:best,learned_words:ids,best_quiz:best,quiz_attempts:Number(p.quizAttempts||0),last_active_at:now,updated_at:now},{onConflict:'user_id,grade'});
  badge(r.error?'⚠ Local progress safe':'✓ Supabase synced')
}
function loadExpansion(){if(document.querySelector('script[data-grade2-content-expansion],script[src*="grade2-content-expansion.js"]'))return;const s=document.createElement('script');s.src='grade2-content-expansion.js?v=20260901';s.async=true;s.dataset.grade2ContentExpansion='1';document.head.appendChild(s)}
(async()=>{try{const u=await getUser();if(!u){location.replace('../login.html?redirect='+encodeURIComponent('grade2/index.html'));return}if(!(await checkGrade(u)))return;loadExpansion();await restore(u);await save(u);let last=localStorage.getItem(KEY)||'';setInterval(async()=>{const now=localStorage.getItem(KEY)||'';if(now!==last){last=now;await save(u);last=now}},2000)}catch(e){console.warn('[Grade2 Bridge]',e);badge('⚠ Local mode')}})();
})();