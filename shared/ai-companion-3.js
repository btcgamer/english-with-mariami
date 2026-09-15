/* MAGIC NEON AI ACADEMY — AI Companion 3.0 (visual-only reaction layer) */
(function(){'use strict';
  function boot(){
    if(document.documentElement.dataset.aiCompanion3==='1')return;
    document.documentElement.dataset.aiCompanion3='1';
    document.addEventListener('click',function(e){
      const choice=e.target.closest&&e.target.closest('.choice');
      if(choice){
        const hero=document.querySelector('.hero.card');
        if(!hero)return;
        const robot=hero.querySelector('.robot');
        if(!robot)return;
        robot.classList.remove('ai-react-correct','ai-react-wrong');
        void robot.offsetWidth;
        robot.classList.add(choice.dataset.answer==='right'?'ai-react-correct':'ai-react-wrong');
        window.setTimeout(function(){robot.classList.remove('ai-react-correct','ai-react-wrong')},900);
      }
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
