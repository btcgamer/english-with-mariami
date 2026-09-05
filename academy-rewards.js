/* MAGIC NEON AI ACADEMY — unified Supabase rewards + mission HUD */
(function(){
'use strict';
const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||window.supabase;
if(!client)return;
const PATH=(location.pathname||'').toLowerCase();
const gradeMatch=PATH.match(/grade([234])/);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
async function user(){const r=await client.auth.getUser();return r.error?null:r.data?.user||null}
async function profile(uid){const r=await client.from('profiles').select('role,grade,points').eq('user_id',uid).maybeSingle();return r.data||null}
async function state(uid){
 const [reward,streak]=await Promise.all([
  client.from('academy_reward_state').select('xp,stars,lessons_completed').eq('student_id',uid).maybeSingle(),
  client.from('academy_streaks').select('current_streak,best_streak,last_active_date').eq('student_id',uid).maybeSingle()
 ]);
 return {reward:reward.data||{xp:0,stars:0,lessons_completed:0},streak:streak.data||{current_streak:0,best_streak:0,last_active_date:null}};
}
async function lessons(uid,g){
 const l=await client.from('lessons').select('id,lesson_number,title,topic').eq('grade',g).order('lesson_number',{ascending:true});
 if(l.error)return [];
 const p=await client.from('lesson_progress').select('lesson_id,completed,score').eq('student_id',uid).eq('grade',g);
 const map=new Map((p.data||[]).map(x=>[String(x.lesson_id),x]));
 return (l.data||[]).map(x=>({...x,progress:map.get(String(x.id))||null}));
}
function ensureStyle(){if(document.getElementById('__academy_rewards_style'))return;const s=document.createElement('style');s.id='__academy_rewards_style';s.textContent=`
#__academy_rewards_hud{position:fixed;top:76px;right:14px;z-index:99996;width:min(330px,calc(100vw - 28px));padding:14px;border:1px solid rgba(0,234,255,.42);border-radius:18px;background:rgba(2,10,25,.9);box-shadow:0 10px 45px rgba(0,0,0,.4),0 0 25px rgba(0,234,255,.12);backdrop-filter:blur(16px);font:800 12px/1.35 system-ui,Arial,sans-serif;color:#fff}#__academy_rewards_hud .ar-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:10px}#__academy_rewards_hud .ar-title{font-size:13px;letter-spacing:.06em;text-shadow:0 0 12px #00eaff}#__academy_rewards_hud .ar-grade{color:#ffe600}#__academy_rewards_hud .ar-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}#__academy_rewards_hud .ar-stat{padding:9px 6px;border:1px solid rgba(0,234,255,.2);border-radius:12px;text-align:center;background:rgba(4,31,59,.58)}#__academy_rewards_hud .ar-num{display:block;font-size:18px;color:#00eaff;margin-bottom:2px}#__academy_rewards_hud .ar-progress{height:7px;border-radius:20px;background:#020c20;overflow:hidden;margin:10px 0 7px}#__academy_rewards_hud .ar-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#00eaff,#8b5cff);transition:width .4s}#__academy_rewards_hud .ar-next{display:flex;gap:8px;align-items:center;margin-top:10px;padding:9px 10px;border-radius:12px;background:rgba(0,234,255,.08);border:1px solid rgba(0,234,255,.2)}#__academy_rewards_hud .ar-next a{color:#fff;text-decoration:none}#__academy_rewards_hud .ar-next a:hover{text-decoration:underline}#__academy_rewards_hud .ar-muted{color:#a9c9d8;font-weight:700} @media(max-width:650px){#__academy_rewards_hud{top:auto;bottom:14px;right:14px}}`;document.head.appendChild(s)}
function render(g,ls,st){
 ensureStyle();let hud=document.getElementById('__academy_rewards_hud');if(!hud){hud=document.createElement('aside');hud.id='__academy_rewards_hud';document.body.appendChild(hud)}
 const done=ls.filter(x=>x.progress?.completed).length,total=ls.length||60,pct=Math.round(done/total*100),r=st.reward||{},s=st.streak||{};
 const next=ls.find(x=>!x.progress?.completed);
 const nextHtml=next?`<div class="ar-next">🚀 <a href="/grade${g}/index.html?lesson_id=${encodeURIComponent(next.id)}">Next: Lesson ${next.lesson_number} — ${esc(next.title||'Mission')}</a></div>`:`<div class="ar-next">🏆 <span>GRADE ${g} COMPLETE — ALL MISSIONS CLEARED</span></div>`;
 hud.innerHTML=`<div class="ar-head"><span class="ar-title">⚡ MISSION COMMAND</span><span class="ar-grade">GRADE ${g}</span></div><div><b>MISSION STATUS</b> ${done}/${total}</div><div class="ar-progress"><i style="width:${pct}%"></i></div><div class="ar-grid"><div class="ar-stat"><span class="ar-num">${clamp(r.xp,0,999999)}</span>XP</div><div class="ar-stat"><span class="ar-num">${clamp(r.stars,0,999999)}</span>⭐</div><div class="ar-stat"><span class="ar-num">${clamp(s.current_streak,0,9999)}</span>🔥</div></div>${nextHtml}`;
}
async function init(){
 const u=await user();if(!u)return;const p=await profile(u.id);if(!p||String(p.role||'').toLowerCase()!=='student')return;const g=gradeMatch?Number(gradeMatch[1]):Number(p.grade);if(![2,3,4].includes(g))return;
 try{const [ls,st]=await Promise.all([lessons(u.id,g),state(u.id)]);render(g,ls,st);window.__ACADEMY_REWARDS__={grade:g,userId:u.id,refresh:async()=>render(g,await lessons(u.id,g),await state(u.id))};}catch(e){console.warn('[Academy Rewards]',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
