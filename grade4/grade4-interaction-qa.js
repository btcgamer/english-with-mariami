(function(){'use strict';
function install(){
  document.addEventListener('click',function(e){
    const retry=e.target.closest('[data-g4-retry]');
    if(!retry)return;
    const lesson=retry.closest('.g4-live-lesson');
    if(!lesson)return;
    lesson.querySelectorAll('.quiz-q').forEach(q=>{
      q.querySelectorAll('.g4-option').forEach(b=>{
        b.disabled=false;
        b.classList.remove('quiz-correct','quiz-wrong');
      });
    });
    retry.remove();
    const status=lesson.querySelector('.g4-quiz-feedback');
    if(status)status.textContent='';
  });
  document.addEventListener('click',function(e){
    const opt=e.target.closest('[data-option]');
    if(!opt)return;
    setTimeout(function(){
      const lesson=opt.closest('.g4-live-lesson');
      if(!lesson)return;
      const qs=[...lesson.querySelectorAll('.quiz-q')];
      if(!qs.length||!qs.every(q=>q.querySelector('.quiz-correct')))return;
      if(!qs.some(q=>q.querySelector('.quiz-wrong')))return;
      if(lesson.querySelector('[data-g4-retry]'))return;
      const b=document.createElement('button');
      b.type='button';
      b.className='g4-complete';
      b.dataset.g4Retry='1';
      b.textContent='↻ RETRY QUIZ';
      const fb=document.createElement('small');
      fb.className='g4-quiz-feedback';
      fb.setAttribute('aria-live','polite');
      fb.textContent='Quiz not passed yet. You need 70% or higher — try again!';
      lesson.querySelector('[data-complete]')?.before(fb,b);
    },0);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
