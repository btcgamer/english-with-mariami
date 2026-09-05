/* WORLD PORTAL ENGINE V1 — visual state layer only */
(function(){'use strict';
const root=document.getElementById('missions'); if(!root)return;
const worlds=[['01','⚡','NEO CORE','Foundation missions'],['02','🧠','MIND MATRIX','Grammar & thinking'],['03','🌌','GALAXY LAB','Reading & discovery'],['04','🎧','ECHO SECTOR','Listening missions'],['05','🎤','VOICE ORBIT','Speaking missions'],['06','🏆','MASTER GATE','Final mastery']];
function decorate(){[...root.querySelectorAll('.mission')].forEach((card,i)=>{if(card.dataset.portalReady)return;card.dataset.portalReady='1';card.dataset.world=String((i%6)+1);card.style.setProperty('--world-index',(i%6)+1);card.classList.add('world-portal');const w=worlds[i%6];if(!card.querySelector('.portal-world')){const el=document.createElement('div');el.className='portal-world';el.innerHTML='<span>'+w[1]+'</span><small>WORLD '+w[0]+' • '+w[2]+'</small>';card.prepend(el)}card.setAttribute('aria-label',(card.textContent||'').trim()+' — World '+w[0]);});}
new MutationObserver(decorate).observe(root,{childList:true,subtree:true});decorate();window.G4WorldPortalEngine={decorate};
})();
