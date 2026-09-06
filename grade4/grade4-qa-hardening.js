/* Grade 4 interaction hardening — mission completion gate */
(function(){'use strict';
function arm(){
 const complete=document.querySelector('[data-complete]');
 if(!complete)return;
 complete.disabled=true; complete.title='Complete the mission task first';
 const task=document.querySelector('.mission-task'); if(!task)return;
 const unlock=()=>{complete.disabled=false;complete.removeAttribute('title')};
 task.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.ok==='true')unlock()}));
 const save=task.querySelector('[data-save]');
 if(save)save.addEventListener('click',()=>{const input=task.querySelector('.answer');if(input&&input.value.trim().length>=20)unlock()});
}
document.addEventListener('DOMContentLoaded',arm);
document.addEventListener('click',e=>{const c=e.target.closest('[data-complete]');if(c&&c.disabled){e.preventDefault();const t=document.querySelector('.mission-task');if(t){let m=t.querySelector('.quizmsg');if(!m){m=document.createElement('div');m.className='quizmsg';t.appendChild(m)}m.textContent='🎯 Finish the mission task first, then complete the mission.'}}},true);
})();