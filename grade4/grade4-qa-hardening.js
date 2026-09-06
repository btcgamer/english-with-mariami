/* Grade 4 interaction hardening v2 — deterministic mission completion gate */
(function(){'use strict';
function arm(){
 const complete=document.querySelector('[data-complete]');
 const task=document.querySelector('.mission-task');
 if(!complete||!task||complete.dataset.gateArmed==='true')return;
 complete.dataset.gateArmed='true';
 const setLocked=locked=>{complete.disabled=locked;complete.setAttribute('aria-disabled',String(locked));if(locked)complete.title='Complete the mission task first';else complete.removeAttribute('title')};
 const evaluate=()=>{
  const choices=task.querySelectorAll('.choice');
  if(choices.length){setLocked(!task.querySelector('.choice.g4-answered-correctly'));return}
  const input=task.querySelector('.answer');
  const save=task.querySelector('[data-save]');
  setLocked(!(input&&save&&input.value.trim().length>=20&&save.dataset.g4Saved==='true'));
 };
 setLocked(true);
 task.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{task.querySelectorAll('.choice').forEach(x=>x.classList.remove('g4-answered-correctly'));if(b.dataset.ok==='true')b.classList.add('g4-answered-correctly');evaluate()}));
 const save=task.querySelector('[data-save]');
 const input=task.querySelector('.answer');
 if(save){save.addEventListener('click',()=>{if(input&&input.value.trim().length>=20){save.dataset.g4Saved='true'}else{save.dataset.g4Saved='false'}evaluate()})}
 if(input){input.addEventListener('input',()=>{if(save)save.dataset.g4Saved='false';evaluate()})}
 evaluate();
}
function scan(){arm()}
scan();
document.addEventListener('DOMContentLoaded',scan);
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{const c=e.target.closest('[data-complete]');if(c&&c.disabled){e.preventDefault();e.stopImmediatePropagation();const t=document.querySelector('.mission-task');if(t){let m=t.querySelector('.quizmsg');if(!m){m=document.createElement('div');m.className='quizmsg'}m.textContent='🎯 Finish the mission task first, then complete the mission.';if(!m.parentNode)t.appendChild(m)}}},true);
})();
