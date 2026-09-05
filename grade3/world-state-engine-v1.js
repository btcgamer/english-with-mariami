/* WORLD STATE ENGINE V1 — progression-aware visual + access layer */
(function(){'use strict';
const root=document.getElementById('missions');if(!root)return;
const KEY='grade3UniverseProgress';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function sync(){
 const state=read(),done=Array.isArray(state.done)?state.done.map(Number):[];
 const cards=[...root.querySelectorAll('.mission')];
 cards.forEach((card,i)=>{
  const mastered=done.includes(i), available=i===0||done.includes(i-1), active=available&&!mastered;
  card.classList.toggle('world-mastered',mastered);card.classList.toggle('world-available',active);card.classList.toggle('world-locked',!mastered&&!available);card.classList.toggle('world-active',active);
  card.dataset.worldState=mastered?'MASTERED':active?'AVAILABLE':'LOCKED';
  let badge=card.querySelector('.world-state');if(!badge){badge=document.createElement('span');badge.className='world-state';card.appendChild(badge)}
  badge.textContent=mastered?'🏆 MASTERED':active?(i===0?'🟢 READY':'⚡ IN PROGRESS'):'🔒 LOCKED';
  card.setAttribute('aria-disabled',(!mastered&&!available)?'true':'false');
 });
}
root.addEventListener('click',e=>{const card=e.target.closest('.mission');if(!card||!root.contains(card))return;if(card.dataset.worldState==='LOCKED'){e.preventDefault();e.stopImmediatePropagation();const n=Number(card.dataset.i||0);alert('🔒 Complete World '+String(n)+' first to unlock this portal.');}},true);
new MutationObserver(sync).observe(root,{childList:true,subtree:true});
document.addEventListener('grade3progress',sync);window.addEventListener('storage',sync);sync();
window.G3WorldStateEngine={sync};
})();