/* WORLD STATE ENGINE V2 — Supabase-backed progression layer */
(function(){'use strict';
const root=document.getElementById('missions');if(!root)return;
const GRADE=3, KEY='grade3UniverseProgress', WORLD_SIZE=5;
let remote=null;
function local(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function localDone(){const s=local();return new Set(Array.isArray(s.done)?s.done.map(Number):[])}
function setCard(card,state){
 const mastered=state==='MASTERED',active=state==='IN_PROGRESS',available=state==='AVAILABLE';
 card.classList.toggle('world-mastered',mastered);card.classList.toggle('world-available',available||active);card.classList.toggle('world-active',active);card.classList.toggle('world-locked',state==='LOCKED');
 card.dataset.worldState=state;card.setAttribute('aria-disabled',state==='LOCKED'?'true':'false');
 let badge=card.querySelector('.world-state');if(!badge){badge=document.createElement('span');badge.className='world-state';card.appendChild(badge)}
 badge.textContent=mastered?'🏆 MASTERED':active?'⚡ IN PROGRESS':available?'🟢 READY':'🔒 LOCKED';
}
function apply(done){
 const cards=[...root.querySelectorAll('.mission')];
 cards.forEach((card,i)=>{const start=i*WORLD_SIZE,end=start+WORLD_SIZE,completed=[...done].filter(n=>n>=start&&n<end).length;let state='LOCKED';if(completed===WORLD_SIZE)state='MASTERED';else if(completed>0)state='IN_PROGRESS';else if(i===0||done.has(start-1))state='AVAILABLE';setCard(card,state)});
}
async function fetchRemote(){
 const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;if(!client?.auth)return null;
 try{const {data:{user}}=await client.auth.getUser();if(!user)return null;const {data,error}=await client.from('lesson_progress').select('lesson_id,completed').eq('student_id',user.id).eq('grade',GRADE);if(error)throw error;return new Set((data||[]).filter(x=>x.completed).map(x=>{const m=String(x.lesson_id||'').match(/(?:lesson[-_ ]?)?(\d+)$/i);return m?Number(m[1])-1:-1}).filter(n=>n>=0&&n<60));}catch(e){console.warn('Grade 3 Supabase progress sync:',e);return null}}
async function sync(){const remoteDone=await fetchRemote();remote=remoteDone;if(remoteDone){apply(remoteDone);document.documentElement.dataset.progressSource='supabase'}else{apply(localDone());document.documentElement.dataset.progressSource='local-fallback'}}
root.addEventListener('click',e=>{const card=e.target.closest('.mission');if(!card||!root.contains(card))return;if(card.dataset.worldState==='LOCKED'){e.preventDefault();e.stopImmediatePropagation();alert('🔒 Complete the previous World to unlock this portal.');}},true);
new MutationObserver(()=>apply(remote||localDone())).observe(root,{childList:true,subtree:true});
document.addEventListener('grade3progress',sync);window.addEventListener('storage',sync);sync();window.G3WorldStateEngine={sync};
})();