/* English with Mariami — Lesson functional QA fixes */
(function(){
  'use strict';

  const path=(location.pathname||'').toLowerCase();
  if(!(path.endsWith('/lesson.html')||path==='lesson.html')) return;
  if(document.querySelector('script[data-ewm-lesson-functional-qa]')) return;

  function gradeNumber(){
    const params=new URLSearchParams(location.search);
    const value=Number(params.get('grade')||params.get('class')||'2');
    return [2,3,4].includes(value) ? value : 2;
  }

  function key(grade,suffix){
    return `grade${grade}${suffix}`;
  }

  function syncProgress(grade){
    try{
      const sync=window.ENGLISH_MARIAMI_PROGRESS_SYNC;
      if(sync && typeof sync.saveGrade==='function') return sync.saveGrade(grade,true);
    }catch(_){ }
    return null;
  }

  function bindQuiz(){
    const finish=document.getElementById('finishQuiz');
    const quiz=document.getElementById('quiz');
    const result=document.getElementById('quizResult');
    if(!finish||!quiz||!result||finish.dataset.ewmFunctional) return;

    finish.dataset.ewmFunctional='1';
    finish.addEventListener('click',function(){
      const items=[...quiz.querySelectorAll('.quiz-item')];
      if(!items.length){
        result.textContent='🧠 Quiz-ის კითხვები ჯერ არ არის.';
        return;
      }

      let answered=0;
      let correct=0;
      items.forEach(item=>{
        const selected=item.querySelector('.option.correct, .option.wrong');
        if(!selected) return;
        answered++;
        if(!selected.classList.contains('wrong')) correct++;
      });

      const total=items.length;
      const percent=Math.round((correct/total)*100);
      const grade=gradeNumber();

      if(answered<total){
        result.textContent=`🧠 უპასუხე ყველა კითხვას — ${answered}/${total}.`;
        return;
      }

      /* Grade 2 has no legacy quiz observer; Grade 3/4 are already
         counted by progress-sync.js, so do not double-count them here. */
      if(grade===2){
        const attempts=Math.max(0,Number(localStorage.getItem(key(grade,'QuizAttempts'))||0))+1;
        const previousBest=Math.max(0,Number(localStorage.getItem(key(grade,'BestScore'))||0));
        const best=Math.max(previousBest,percent);
        localStorage.setItem(key(grade,'QuizAttempts'),String(attempts));
        localStorage.setItem(key(grade,'BestScore'),String(best));
        result.textContent=`🏆 შედეგი: ${correct}/${total} — ${percent}%. საუკეთესო: ${best}%.`;
      }else{
        const previousBest=Math.max(0,Number(localStorage.getItem(key(grade,'BestScore'))||0));
        result.textContent=`🏆 შედეგი: ${correct}/${total} — ${percent}%. საუკეთესო: ${Math.max(previousBest,percent)}%.`;
      }

      finish.textContent='✅ შედეგი დაფიქსირდა';
      void syncProgress(grade);
    });
  }

  function bindCompletion(){
    const button=document.getElementById('completeLesson');
    if(!button||button.dataset.ewmFunctionalComplete) return;

    button.dataset.ewmFunctionalComplete='1';
    button.addEventListener('click',function(event){
      event.preventDefault();
      event.stopImmediatePropagation();

      const grade=gradeNumber();
      const xpKey=key(grade,'XP');
      const starKey=key(grade,'Stars');
      const currentXP=Math.max(0,Number(localStorage.getItem(xpKey)||0));
      const currentStars=Math.max(0,Number(localStorage.getItem(starKey)||0));
      if(button.dataset.completed==='1') return;
      button.dataset.completed='1';

      localStorage.setItem(xpKey,String(currentXP+10));
      localStorage.setItem(starKey,String(currentStars+1));
      button.textContent='✅ გაკვეთილი დასრულებულია +10 XP';
      button.disabled=true;

      const bar=document.getElementById('progressBar');
      if(bar) bar.style.width='100%';
      void syncProgress(grade);
    },true);
  }

  function boot(){bindQuiz();bindCompletion();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  new MutationObserver(boot).observe(document.body,{childList:true,subtree:true});
})();
