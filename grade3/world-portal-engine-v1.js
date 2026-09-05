/* WORLD PORTAL ENGINE V1 — visual state layer only */
(function(){'use strict';
const root=document.getElementById('missions'); if(!root)return;
const worlds=[['01','🌌','STARLIGHT CITY','Vocabulary & discovery'],['02','🧭','EXPLORER ZONE','Grammar navigation'],['03','🚀','ROCKET LAB','Actions & routines'],['04','🪐','PLANET STORIES','Reading missions'],['05','🎧','ECHO NEBULA','Listening missions'],['06','🎤','SPEAKING ORBIT','Speaking missions'],['07','🧩','PUZZLE CORE','Sentence building'],['08','⚡','ENERGY STATION','Practice missions'],['09','🔮','MYSTIC LIBRARY','Reading & meaning'],['10','🤖','AI COMMAND','Challenge missions'],['11','🏆','CHAMPION RING','Mixed mastery'],['12','✨','FINAL GALAXY','Final review']];
function decorate(){const cards=[...root.querySelectorAll('.mission')];cards.forEach((card,i)=>{if(card.dataset.portalReady)return;card.dataset.portalReady='1';card.dataset.world=String(i+1);card.style.setProperty('--world-index',i+1);const w=worlds[i%worlds.length];card.classList.add('world-portal');const tag=card.querySelector('.portal-world');if(!tag){const el=document.createElement('div');el.className='portal-world';el.innerHTML='<span>'+w[1]+'</span><small>WORLD '+w[0]+'</small>';card.prepend(el)}card.setAttribute('aria-label',(card.textContent||'').trim()+' — World '+w[0]);});}
new MutationObserver(decorate).observe(root,{childList:true,subtree:true}); decorate();
window.G3WorldPortalEngine={decorate};
})();
