(function(){'use strict';
function scrollToNextLesson(modal){
  if(!modal)return;
  const lessons=[...modal.querySelectorAll('.g4-live-lesson')];
  const next=lessons.find(x=>!x.querySelector('.g4-live-lesson-head .num')?.textContent.includes('COMPLETED'))||lessons[0];
  if(next){next.scrollIntoView({behavior:'smooth',block:'center'});next.classList.add('g4-qa-focus');setTimeout(()=>next.classList.remove('g4-qa-focus'),1400)}
}
function openAndFocus(card){
  if(!card)return;
  card.click();
  setTimeout(()=>scrollToNextLesson(document.querySelector('.g4-vocab-modal')),80);
}
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
      b.type='button';b.className='g4-complete';b.dataset.g4Retry='1';b.textContent='↻ RETRY QUIZ';
      const fb=document.createElement('small');fb.className='g4-quiz-feedback';fb.setAttribute('aria-live','polite');
      fb.textContent='Quiz not passed yet. You need 70% or higher — try again!';
      lesson.querySelector('[data-complete]')?.before(fb,b);
    },0);
  });
  const review=document.querySelector('#review');
  if(review){review.onclick=function(){
    const cards=[...document.querySelectorAll('#missions .mission')];
    const target=cards.find(c=>!c.classList.contains('done'))||cards[0];
    if(target)openAndFocus(target);
  }}
  const random=document.querySelector('#randomMission');
  if(random){random.onclick=function(){
    const cards=[...document.querySelectorAll('#missions .mission')];
    if(!cards.length)return;
    const pending=cards.filter(c=>!c.classList.contains('done'));
    const pool=pending.length?pending:cards;
    openAndFocus(pool[Math.floor(Math.random()*pool.length)]);
  }}
  const search=document.querySelector('#worldSearch');
  if(search){search.addEventListener('input',function(){
    const term=search.value.trim().toLowerCase();
    document.querySelectorAll('#missions .mission').forEach(card=>{card.hidden=!!term&&!card.textContent.toLowerCase().includes(term)});
  });}
  let lastWorld=null;
  document.addEventListener('click',e=>{const card=e.target.closest('#missions .mission');if(card)lastWorld=card});
  const observer=new MutationObserver(()=>{
    const modal=document.querySelector('.g4-vocab-modal');
    if(!modal)return;
    if(modal.dataset.qaWired==='1')return;
    modal.dataset.qaWired='1';
    const close=modal.querySelector('.g4-close');
    if(close)close.addEventListener('click',()=>setTimeout(()=>lastWorld?.focus(),0));
  });
  observer.observe(document.body,{childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
