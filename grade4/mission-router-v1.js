/* MISSION ROUTER V2 — Supabase-aware next-lesson navigation */
(function(){'use strict';
const GRADE=4,WORLD_SIZE=5,root=document.getElementById('missions');if(!root)return;
const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
async function progress(){if(!client)return null;try{const {data:{user}}=await client.auth.getUser();if(!user)return null;const {data,error}=await client.from('lesson_progress').select('lesson_id,completed').eq('student_id',user.id).eq('grade',GRADE);if(error)return null;return new Set((data||[]).filter(x=>x.completed===true).map(x=>String(x.lesson_id)))}catch(e){return null}}
async function lessons(){if(!client)return null;try{const {data,error}=await client.from('lessons').select('id,lesson_number').eq('grade',GRADE).order('lesson_number',{ascending:true});return error||!Array.isArray(data)?null:data}catch(e){return null}}
async function nextLesson(){const [p,l]=await Promise.all([progress(),lessons()]);if(!l?.length)return null;return l.find(x=>!p||!p.has(String(x.id)))||l[l.length-1]}
function openWorld(i){const card=root.querySelector(`[data-i="${i}"]`);if(!card)return;card.scrollIntoView({behavior:'smooth',block:'center'});const btn=card.querySelector('.g4-open');if(btn)setTimeout(()=>btn.click(),220)}
async function routeStart(){const l=await nextLesson();if(l){openWorld(Math.max(0,Math.min(11,Math.floor((Number(l.lesson_number)-1)/WORLD_SIZE))));return}const c=[...root.querySelectorAll('.mission')].find(x=>x.dataset.worldState!=='LOCKED'&&!x.classList.contains('done'));if(c)openWorld(Number(c.dataset.i)||0)}
async function routeWorld(i){const [p,l]=await Promise.all([progress(),lessons()]);if(!l){openWorld(i);return}const lo=i*WORLD_SIZE+1,hi=lo+WORLD_SIZE-1;const n=l.find(x=>Number(x.lesson_number)>=lo&&Number(x.lesson_number)<=hi&&(!p||!p.has(String(x.id))));openWorld(n?i:Math.min(11,i))}
const start=document.getElementById('start');if(start)start.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();routeStart()},true);
root.addEventListener('click',e=>{const card=e.target.closest('.mission');if(!card||card.dataset.worldState==='LOCKED')return;if(e.target.closest('.g4-open')){e.preventDefault();e.stopImmediatePropagation();routeWorld(Number(card.dataset.i)||0)}},true);
window.G4MissionRouterV2={nextLesson,routeStart,routeWorld};
})();
