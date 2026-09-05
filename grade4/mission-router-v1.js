/* MISSION ROUTER V1 — Supabase-aware next-lesson navigation */
(function(){'use strict';
const GRADE=4, WORLD_SIZE=5, root=document.getElementById('missions'); if(!root)return;
const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
async function nextLesson(){
  if(!client)return null;
  try{
    const {data:{user}}=await client.auth.getUser(); if(!user)return null;
    const {data,error}=await client.from('lesson_progress').select('lesson_id,completed,score').eq('student_id',user.id).eq('grade',GRADE);
    if(error||!Array.isArray(data))return null;
    const completed=new Set(data.filter(x=>x.completed===true).map(x=>String(x.lesson_id)));
    const {data:lessons,error:le}=await client.from('lessons').select('id,lesson_number').eq('grade',GRADE).order('lesson_number',{ascending:true});
    if(le||!Array.isArray(lessons))return null;
    const next=lessons.find(l=>!completed.has(String(l.id)));
    return next||lessons[lessons.length-1]||null;
  }catch(e){console.warn('G4 mission router:',e);return null}
}
function openWorld(i){const card=root.querySelector(`[data-i="${i}"]`);if(!card)return;card.scrollIntoView({behavior:'smooth',block:'center'});const btn=card.querySelector('.g4-open');if(btn)setTimeout(()=>btn.click(),220)}
async function routeStart(){
  const lesson=await nextLesson();
  if(lesson&&Number.isFinite(Number(lesson.lesson_number))){const n=Number(lesson.lesson_number)-1;openWorld(Math.max(0,Math.min(11,Math.floor(n/WORLD_SIZE))));return;}
  const fallback=[...root.querySelectorAll('.mission')].find(c=>!c.classList.contains('done')); if(fallback)openWorld(Number(fallback.dataset.i)||0);
}
const start=document.getElementById('start');if(start){start.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();routeStart()},true)}
window.G4MissionRouterV1={nextLesson,routeStart};
})();
