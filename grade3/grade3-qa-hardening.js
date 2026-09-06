/* Grade 3 interaction hardening — stable answer gating */
(function(){
  'use strict';
  let answered=false;
  let currentMissionButton=null;

  function button(){return document.querySelector('[data-complete]')}
  function task(){return document.querySelector('.mission-task')}
  function setMessage(text){
    const box=task();
    if(!box)return;
    let msg=box.querySelector('.quizmsg');
    if(!msg){msg=document.createElement('div');msg.className='quizmsg';box.appendChild(msg)}
    msg.textContent=text;
  }
  function resetForMission(){
    answered=false;
    const b=button();
    if(!b)return;
    currentMissionButton=b;
    b.disabled=true;
    b.title='Finish the mission task first';
  }
  function unlock(){
    answered=true;
    const b=button();
    if(!b)return;
    b.disabled=false;
    b.removeAttribute('title');
  }
  function isCorrectChoice(target){
    const btn=target.closest('.choice');
    const box=btn?.closest('.mission-task');
    return !!(btn&&box&&btn.dataset.ok==='true');
  }

  document.addEventListener('DOMContentLoaded',function(){
    resetForMission();

    document.addEventListener('click',function(e){
      const choice=e.target.closest('.choice');
      if(choice && choice.closest('.mission-task') && choice.dataset.ok==='true'){
        unlock();
        return;
      }

      const save=e.target.closest('[data-save]');
      if(save && save.closest('.mission-task')){
        const input=save.closest('.mission-task').querySelector('.answer');
        if(input && input.value.trim().length>=10)unlock();
        return;
      }

      const complete=e.target.closest('[data-complete]');
      if(complete && !answered){
        e.preventDefault();
        e.stopImmediatePropagation();
        setMessage('🎯 Finish the mission task first, then complete the mission.');
      }
    },true);

    document.addEventListener('input',function(e){
      const input=e.target.closest('.mission-task .answer');
      if(input && input.value.trim().length>=10)unlock();
    },true);

    const observer=new MutationObserver(function(){
      const b=button();
      if(b && b!==currentMissionButton)resetForMission();
    });
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();
