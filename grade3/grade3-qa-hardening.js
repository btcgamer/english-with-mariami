/* Grade 3 interaction hardening — answer gating + mission-safe feedback */
(function(){'use strict';
const state={answered:false,saved:false};
function reset(){state.answered=false;state.saved=false;const b=document.querySelector('[data-complete]');if(b){b.disabled=true;b.title='Complete the mission task first';}}
function unlock(){state.answered=true;const b=document.querySelector('[data-complete]');if(b){b.disabled=false;b.removeAttribute('title');}}
function inspect(){reset();const task=document.querySelector('.mission-task');if(!task)return;
 task.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.ok==='true')unlock()}));
 const save=task.querySelector('[data-save]');if(save)save.addEventListener('click',()=>{const input=task.querySelector('.answer');if(input&&input.value.trim().length>=10){state.saved=true;unlock()}});
 const input=task.querySelector('.answer');if(input)input.addEventListener('input',()=>{if(input.value.trim().length>=10)unlock()});
}
document.addEventListener('DOMContentLoaded',()=>{inspect();new MutationObserver(()=>{if(document.querySelector('[data-complete]')?.disabled!==true&&document.querySelector('.mission-task'))inspect()}).observe(document.body,{childList:true,subtree:true})});
document.addEventListener('click',e=>{const complete=e.target.closest('[data-complete]');if(complete&&!state.answered){e.preventDefault();e.stopImmediatePropagation();const task=document.querySelector('.mission-task');if(task){let msg=task.querySelector('.quizmsg');if(!msg){msg=document.createElement('div');msg.className='quizmsg';task.appendChild(msg)}msg.textContent='🎯 Finish the mission task first, then complete the mission.'}},true);
})();
