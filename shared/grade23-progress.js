/* English with Mariami — Grade 2/3 Universe progress bridge */
(function(){
  'use strict';
  const cfg=window.GRADE23_UNIVERSE||{};
  const grade=Number(cfg.grade||0);
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(![2,3].includes(grade)||!client)return;

  const key=s=>`grade${grade}${s}`;
  const read=(name,fallback)=>{try{const v=JSON.parse(localStorage.getItem(name)||'null');return v==null?fallback:v}catch(_){return fallback}};
  const write=(name,value)=>{try{localStorage.setItem(name,JSON.stringify(value))}catch(_){}
  };
  const decodeWord=value=>{try{return decodeURIComponent(String(value||''))}catch(_){return String(value||'')}};
  const normalizeWords=value=>Array.isArray(value)?value.map(decodeWord).map(v=>String(v).trim()).filter(Boolean):[];
  const words=new Set(normalizeWords(read(key('LearnedWords'),[])));
  let attempts=Number(localStorage.getItem(key('QuizAttempts'))||0)||0;
  let best=Number(localStorage.getItem(key('BestScore'))||0)||0;
  const answered=new WeakMap();
  let saving=false;
  let restoring=true;
  let dirty=false;

  async function user(){try{const r=await client.auth.getUser();return r.data?.user||null}catch(_){return null}}

  async function restore(){
    const u=await user();
    if(!u){restoring=false;return}
    try{
      const r=await client.from('student_progress').select('words_learned,quiz_completed,best_quiz,learned_words,score').eq('user_id',u.id).eq('grade',grade).maybeSingle();
      if(r.error)throw r.error;
      const row=r.data;
      if(row){
        const beforeWords=[...words];
        const beforeAttempts=attempts;
        const beforeBest=best;
        normalizeWords(row.learned_words).forEach(w=>words.add(w));
        attempts=Math.max(attempts,Number(row.quiz_completed)||0);
        best=Math.max(best,Number(row.best_quiz)||0,Number(row.score)||0);

        const mergedWords=[...words];
        const wordsChanged=mergedWords.length!==beforeWords.length||mergedWords.some(w=>!beforeWords.includes(w));
        const attemptsChanged=attempts!==beforeAttempts;
        const bestChanged=best!==beforeBest;
        if(wordsChanged)write(key('LearnedWords'),mergedWords);
        if(attemptsChanged)localStorage.setItem(key('QuizAttempts'),String(attempts));
        if(bestChanged)localStorage.setItem(key('BestScore'),String(best));

        const remoteWordCount=Number(row.words_learned)||0;
        const remoteAttempts=Number(row.quiz_completed)||0;
        const remoteBest=Math.max(Number(row.best_quiz)||0,Number(row.score)||0);
        dirty=wordsChanged&&words.size>remoteWordCount||attempts>remoteAttempts||best>remoteBest;
      }
    }catch(e){console.warn('Grade '+grade+' progress restore error:',e)}finally{
      restoring=false;
      if(dirty)save();
    }
  }

  async function save(){
    if(saving||restoring||!dirty)return;
    const u=await user();if(!u)return;
    saving=true;
    const now=new Date().toISOString();
    const learned=[...words];
    const payload={user_id:u.id,grade,words_learned:learned.length,quiz_completed:attempts,score:best,learned_words:learned,best_quiz:best,last_active_at:now,updated_at:now};
    try{const r=await client.from('student_progress').upsert(payload,{onConflict:'user_id,grade'});if(!r.error)dirty=false;else console.warn('Grade '+grade+' progress sync error:',r.error)}catch(e){console.warn('Grade '+grade+' progress sync error:',e)}finally{saving=false}
  }

  function recordQuiz(percent){
    const pct=Math.max(0,Math.min(100,Number(percent)||0));
    attempts+=1;
    best=Math.max(best,pct);
    localStorage.setItem(key('QuizAttempts'),String(attempts));
    localStorage.setItem(key('BestScore'),String(best));
    dirty=true;
    save();
  }

  document.addEventListener('click',function(e){
    const wordBtn=e.target.closest('[data-speak]');
    if(wordBtn){const w=decodeWord(wordBtn.dataset.speak||'').trim();if(w){words.add(w);write(key('LearnedWords'),[...words]);dirty=true;save()}}

    const submit3=e.target.closest('[data-submit-quiz]');
    if(submit3 && grade===3){
      setTimeout(function(){
        const modal=submit3.closest('.g3-vocab-dialog');
        const qs=modal?[...modal.querySelectorAll('.g3-question')]:[];
        if(!qs.length)return;
        const correct=qs.filter(q=>q.querySelector('[data-feedback][data-ok="1"]')).length;
        recordQuiz(Math.round(correct/qs.length*100));
      },0);
      return;
    }

    const option=e.target.closest('.quiz-q [data-option]');
    if(!option)return;
    const q=option.closest('.quiz-q');if(!q)return;
    const set=answered.get(q)||new Set();
    if(set.has(option))return;
    set.add(option);answered.set(q,set);
    const qs=[...q.parentElement.querySelectorAll('.quiz-q')];
    if(qs.some(x=>!answered.has(x)))return;
    const correct=qs.filter(x=>{const selected=answered.get(x);return [...selected][0]?.dataset.option===x.dataset.correct}).length;
    const percent=qs.length?Math.round(correct/qs.length*100):0;
    recordQuiz(percent);
  },true);

  window.addEventListener('beforeunload',()=>{if(dirty)save()});
  setInterval(()=>save(),5000);
  restore();
})();