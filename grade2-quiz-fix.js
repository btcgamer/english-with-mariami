/* Grade 2 quiz fix — 30 questions, reliable answer checking */
(function(){
  'use strict';

  function start(){
    if(typeof window.allWords!=='function' || typeof window.save!=='function') return false;
    const box=document.getElementById('quizBox');
    const result=document.getElementById('quizResult');
    if(!box || !result) return false;

    const pool=window.allWords()
      .filter(w=>Array.isArray(w)&&w.length>=4)
      .map(w=>({en:String(w[0]),ka:String(w[1])}))
      .filter((x,i,a)=>a.findIndex(y=>y.en.toLowerCase()===x.en.toLowerCase())===i);

    if(pool.length<30) return false;

    let current=[];
    let answered=0;
    let earned=0;

    function shuffle(a){
      return a.slice().sort(()=>Math.random()-0.5);
    }

    function esc(s){
      return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
    }

    window.buildQuiz=function(){
      current=shuffle(pool).slice(0,30);
      answered=0;
      earned=0;
      result.innerHTML='';

      box.innerHTML=current.map((q,i)=>{
        const wrong=shuffle(pool.filter(x=>x.en.toLowerCase()!==q.en.toLowerCase()))
          .slice(0,3);
        const options=shuffle([q,...wrong]);
        return `<div class="lesson quiz-question" data-index="${i}" data-answered="0">
          <b>${i+1}. რას ნიშნავს <span style="color:#ffe600">“${esc(q.en)}”</span>?</b>
          <div class="quiz-options">
            ${options.map(o=>`<button type="button" class="option" data-answer="${esc(o.ka)}">${esc(o.ka)}</button>`).join('')}
          </div>
        </div>`;
      }).join('');

      box.querySelectorAll('.quiz-question').forEach(question=>{
        question.querySelectorAll('.option').forEach(button=>{
          button.addEventListener('click',function(){
            if(question.dataset.answered==='1') return;
            question.dataset.answered='1';
            answered++;

            const index=Number(question.dataset.index);
            const correct=current[index].ka;
            const answer=this.dataset.answer;

            question.querySelectorAll('.option').forEach(b=>b.disabled=true);

            if(answer===correct){
              this.classList.add('correct');
              this.innerHTML='✅ სწორია! +10 ქულა';
              earned+=10;
              window.quizPoints=(Number(window.quizPoints)||0)+10;
              window.points=(Number(window.points)||0)+10;
            }else{
              this.classList.add('wrong');
              this.innerHTML='❌ არასწორია';
              question.querySelectorAll('.option').forEach(b=>{
                if(b.dataset.answer===correct){
                  b.classList.add('correct');
                  b.innerHTML='✅ სწორი პასუხი';
                }
              });
            }

            window.save();
            if(typeof window.render==='function') window.render();

            if(answered===current.length){
              const percent=Math.round((earned/(current.length*10))*100);
              result.innerHTML=`<div class="quiz-result">
                <div>🎉 ქვიზი დასრულებულია!</div>
                <strong>⭐ ${earned} / ${current.length*10}</strong>
                <div style="margin-top:8px">სწორი პასუხები: ${earned/10} / ${current.length} • ${percent}%</div>
                <br>
                <button type="button" class="btn" id="grade2NewQuiz">🔄 ახალი 30-კითხვიანი ქვიზი</button>
              </div>`;
              document.getElementById('grade2NewQuiz').addEventListener('click',window.buildQuiz);
              result.scrollIntoView({behavior:'smooth',block:'center'});
            }
          });
        });
      });
    };

    /* Keep the original global API, but replace it with the reliable version. */
    window.answerQuiz=function(button,answer,correct){
      const question=button&&button.closest('.quiz-question');
      if(!question || question.dataset.answered==='1') return;
      const target=[...question.querySelectorAll('.option')].find(b=>b.dataset.answer===answer);
      if(target) target.click();
    };

    window.buildQuiz();
    return true;
  }

  let tries=0;
  function boot(){
    if(start()) return;
    if(tries++<40) setTimeout(boot,250);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
