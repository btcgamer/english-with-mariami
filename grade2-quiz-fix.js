/* Grade 2 quiz — 30 questions + safe Supabase progress sync */
(function(){
  'use strict';

  const questions=[
    ['mother','დედა'],['father','მამა'],['sister','და'],['brother','ძმა'],['family','ოჯახი'],
    ['friend','მეგობარი'],['school','სკოლა'],['teacher','მასწავლებელი'],['student','მოსწავლე'],['book','წიგნი'],
    ['notebook','რვეული'],['pen','კალამი'],['pencil','ფანქარი'],['bag','ჩანთა'],['desk','მერხი'],
    ['red','წითელი'],['blue','ლურჯი'],['green','მწვანე'],['yellow','ყვითელი'],['pink','ვარდისფერი'],
    ['dog','ძაღლი'],['cat','კატა'],['bird','ჩიტი'],['fish','თევზი'],['horse','ცხენი'],
    ['apple','ვაშლი'],['banana','ბანანი'],['bread','პური'],['milk','რძე'],['water','წყალი']
  ];

  let current=[];
  let answered=0;
  let earned=0;

  const byId=id=>document.getElementById(id);
  const shuffle=a=>a.slice().sort(()=>Math.random()-0.5);
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function client(){return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null;}

  async function syncQuizResult(correctCount){
    const c=client();
    if(!c) return;
    try{
      const {data:{user}}=await c.auth.getUser();
      if(!user) return;
      const {data:profile}=await c.from('profiles').select('role,grade').eq('user_id',user.id).maybeSingle();
      if(String(profile?.role||'').toLowerCase()!=='student' || Number(profile?.grade)!==2) return;
      const activityId='grade2-quiz-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
      await c.rpc('academy_record_activity',{
        p_grade:2,
        p_activity_type:'quiz',
        p_activity_id:activityId,
        p_score:Math.max(0,Math.min(30,correctCount)),
        p_max_score:30,
        p_points:Math.max(0,Math.min(300,correctCount*10))
      });
    }catch(error){console.warn('Grade 2 progress sync skipped:',error);}
  }

  function updateScore(points){
    try{
      const oldPoints=Number(localStorage.getItem('g2_points')||0);
      const oldQuiz=Number(localStorage.getItem('g2_quiz_points')||0);
      localStorage.setItem('g2_points',String(oldPoints+points));
      localStorage.setItem('g2_quiz_points',String(oldQuiz+points));
    }catch(e){}
    const p=byId('points');
    const q=byId('quizScore');
    if(p) p.textContent=localStorage.getItem('g2_points')||'0';
    if(q) q.textContent=localStorage.getItem('g2_quiz_points')||'0';
  }

  function buildQuiz(){
    const box=byId('quizBox');
    const result=byId('quizResult');
    if(!box || !result) return;

    current=shuffle(questions).slice(0,30);
    answered=0;
    earned=0;
    result.innerHTML='';

    box.innerHTML=current.map((q,i)=>{
      const wrong=shuffle(questions.filter(x=>x[0]!==q[0])).slice(0,3);
      const options=shuffle([q,...wrong]);
      return `<div class="lesson quiz-question" data-index="${i}" data-answered="0">
        <b>${i+1}. რას ნიშნავს <span style="color:#ffe600">“${esc(q[0])}”</span>?</b>
        <div class="quiz-options">
          ${options.map(o=>`<button type="button" class="option" data-answer="${esc(o[1])}">${esc(o[1])}</button>`).join('')}
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
          const correct=current[index][1];
          const answer=this.dataset.answer;
          question.querySelectorAll('.option').forEach(b=>b.disabled=true);

          if(answer===correct){
            this.classList.add('correct');
            this.innerHTML='✅ სწორია! +10 ქულა';
            earned+=10;
            updateScore(10);
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

          if(answered===current.length){
            const correctCount=earned/10;
            const percent=Math.round(correctCount/current.length*100);
            syncQuizResult(correctCount);
            result.innerHTML=`<div class="quiz-result">
              <div>🎉 ქვიზი დასრულებულია!</div>
              <strong>⭐ ${earned} / 300</strong>
              <div style="margin-top:8px">სწორი პასუხები: ${correctCount} / 30 • ${percent}%</div>
              <br>
              <button type="button" class="btn" id="grade2NewQuiz">🔄 ახალი 30-კითხვიანი ქვიზი</button>
            </div>`;
            byId('grade2NewQuiz').addEventListener('click',buildQuiz);
          }
        });
      });
    });
  }

  function boot(){
    const box=byId('quizBox');
    if(!box){setTimeout(boot,300);return;}
    buildQuiz();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
