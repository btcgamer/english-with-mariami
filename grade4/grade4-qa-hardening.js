/* Grade 4 interaction hardening — mission completion gate */
(function(){'use strict';
function arm(){
 const complete=document.querySelector('[data-complete]');
 const task=document.querySelector('.mission-task');
 if(!complete||!task||complete.dataset.gateArmed==='true')return;
 complete.dataset.gateArmed='true';
 complete.disabled=true; complete.setAttribute('aria-disabled','true'); complete.title='Complete the mission task first';
 const unlock=()=>{complete.disabled=false;complete.setAttribute('aria-disabled','false');complete.removeAttribute('title')};
 task.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.ok==='true')unlock()}));
 const save=task.querySelector('[data-save]');
 if(save)save.addEventListener('click',()=>{const input=task.querySelector('.answer');if(input&&input.value.trim().length>=20)unlock()});
}
function scan(){arm()}
scan();
document.addEventListener('DOMContentLoaded',scan);
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{const c=e.target.closest('[data-complete]');if(c&&c.disabled){e.preventDefault();e.stopImmediatePropagation();const t=document.querySelector('.mission-task');if(t){let m=t.querySelector('.quizmsg');if(!m){m=document.createElement('div');m.className='quizmsg'}m.textContent='🎯 Finish the mission task first, then complete the mission.';if(!m.parentNode)t.appendChild(m)}}},true);
})();
