/* English with Mariami — shared student progress sync */
(function(){
  'use strict';

  const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
  if(!client) return;

  const path = (location.pathname || '').toLowerCase();

  /* Lesson presentation layers are visual-only and do not touch progress data. */
  if(path.endsWith('/lesson.html') || path === 'lesson.html'){
    if(!document.querySelector('script[data-ewm-lesson-word-neon]')){
      const neon=document.createElement('script');
      neon.src='/lesson-word-neon.js?v=20260904';
      neon.defer=true;
      neon.dataset.ewmLessonWordNeon='1';
      document.head.appendChild(neon);
    }
    if(!document.querySelector('script[data-ewm-lesson-future-polish]')){
      const polish=document.createElement('script');
      polish.src='/lesson-future-polish.js?v=20260904';
      polish.defer=true;
      polish.dataset.ewmLessonFuturePolish='1';
      document.head.appendChild(polish);
    }
  }

  const gradeMatch = path.match(/(?:^|\/)grade([234])\.html$/);
  const currentGrade = gradeMatch ? Number(gradeMatch[1]) : null;
  const key = (grade, suffix) => `grade${grade}${suffix}`;

  function readJson(name, fallback){
    try{
      const raw = localStorage.getItem(name);
      return raw === null ? fallback : JSON.parse(raw);
    }catch(_){ return fallback; }
  }

  function localProgress(grade){
    const learned = readJson(key(grade,'LearnedWords'), []);
    const words = Array.isArray(learned) ? learned : [];
    const attempts = Number(localStorage.getItem(key(grade,'QuizAttempts')) || 0);
    const best = Number(localStorage.getItem(key(grade,'BestScore')) || 0);
    return {
      learned_words: [...new Set(words.map(String))],
      words_learned: [...new Set(words.map(String))].length,
      quiz_completed: Number.isFinite(attempts) ? Math.max(0, attempts) : 0,
      best_quiz: Number.isFinite(best) ? Math.max(0, Math.min(100, best)) : 0
    };
  }

  function restoreLocal(grade, row){
    if(!row) return false;
    const remoteWords = Array.isArray(row.learned_words) ? row.learned_words : [];
    const localWords = readJson(key(grade,'LearnedWords'), []);
    const localHasData = Array.isArray(localWords) && localWords.length > 0;
    if(remoteWords.length && !localHasData){
      localStorage.setItem(key(grade,'LearnedWords'), JSON.stringify(remoteWords));
      localStorage.setItem(key(grade,'QuizAttempts'), String(row.quiz_completed || 0));
      localStorage.setItem(key(grade,'BestScore'), String(row.best_quiz || 0));
      return true;
    }
    return false;
  }

  async function getUser(){
    try{
      const {data:{user},error} = await client.auth.getUser();
      if(error || !user) return null;
      return user;
    }catch(_){ return null; }
  }

  async function loadGrade(grade){
    const user = await getUser();
    if(!user) return null;
    const {data,error} = await client
      .from('student_progress')
      .select('id,user_id,grade,words_learned,quiz_completed,score,learned_words,best_quiz,last_active_at,updated_at')
      .eq('user_id', user.id)
      .eq('grade', grade)
      .maybeSingle();
    if(error){ console.warn('Progress read error:', error); return null; }
    return data || null;
  }

  async function saveGrade(grade, forceLocal){
    const user = await getUser();
    if(!user) return;
    const p = localProgress(grade);
    if(!forceLocal && p.words_learned === 0 && p.quiz_completed === 0 && p.best_quiz === 0) return;

    const now = new Date().toISOString();
    const payload = {
      user_id: user.id,
      grade,
      words_learned: p.words_learned,
      quiz_completed: p.quiz_completed,
      score: p.best_quiz,
      learned_words: p.learned_words,
      best_quiz: p.best_quiz,
      last_active_at: now,
      updated_at: now
    };

    const {error} = await client
      .from('student_progress')
      .upsert(payload, {onConflict:'user_id,grade'});
    if(error) console.warn('Progress write error:', error);
  }

  async function syncCurrentGrade(){
    if(!currentGrade) return;
    const remote = await loadGrade(currentGrade);
    const restored = restoreLocal(currentGrade, remote);
    if(restored){
      sessionStorage.setItem(`grade${currentGrade}ProgressRestored`, '1');
      location.reload();
      return;
    }
    await saveGrade(currentGrade, false);
  }

  function ensureGrade3And4Tracking(){
    if(!currentGrade || currentGrade === 2) return;

    const seen = new Set(readJson(key(currentGrade,'LearnedWords'), []));

    const attach = () => {
      document.querySelectorAll('.word:not([data-progress-bound]), .vocab .word:not([data-progress-bound])').forEach(el=>{
        el.dataset.progressBound='1';
        el.style.cursor='pointer';
        el.addEventListener('click',()=>{
          const text=(el.querySelector('b')?.textContent || el.textContent || '').trim();
          if(!text) return;
          seen.add(text.replace(/\s+/g,' '));
          localStorage.setItem(key(currentGrade,'LearnedWords'), JSON.stringify([...seen]));
        });
      });
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body,{subtree:true,childList:true});

    const quizObserver = new MutationObserver(()=>{
      const result=document.getElementById('quizResult');
      if(!result) return;
      const scoreText=result.textContent || '';
      const m=scoreText.match(/(\d+)\s*\/\s*(\d+)/);
      if(!m) return;
      const score=Number(m[1]);
      const total=Number(m[2]);
      if(!total) return;
      const percent=Math.round(score/total*100);
      const attempts=Number(localStorage.getItem(key(currentGrade,'QuizAttempts'))||0)+1;
      const oldBest=Number(localStorage.getItem(key(currentGrade,'BestScore'))||0);
      localStorage.setItem(key(currentGrade,'QuizAttempts'),String(attempts));
      localStorage.setItem(key(currentGrade,'BestScore'),String(Math.max(oldBest,percent)));
    });
    quizObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
  }

  function watchLocalChanges(){
    if(!currentGrade) return;
    ensureGrade3And4Tracking();
    let last = JSON.stringify(localProgress(currentGrade));
    setInterval(async ()=>{
      const now = JSON.stringify(localProgress(currentGrade));
      if(now === last) return;
      last = now;
      await saveGrade(currentGrade, true);
      window.dispatchEvent(new CustomEvent('englishMariamiProgressUpdated',{detail:{grade:currentGrade}}));
    }, 1500);
  }

  async function loadAcademyProgress(){
    const hasAcademy = document.getElementById('progress-percent') || document.getElementById('words-count');
    if(!hasAcademy) return;
    const user = await getUser();
    if(!user) return;

    const {data,error} = await client
      .from('student_progress')
      .select('grade,words_learned,quiz_completed,best_quiz,learned_words,updated_at')
      .eq('user_id',user.id)
      .in('grade',[2,3,4])
      .order('grade');
    if(error){ console.warn('Academy progress read error:',error); return; }

    const rows = data || [];
    const profile = await client.from('profiles').select('grade,role').eq('user_id',user.id).maybeSingle();
    const activeGrade = Number(profile.data?.grade || 0);
    const row = rows.find(x=>Number(x.grade)===activeGrade) || rows[0];
    if(!row) return;

    const words = Number(row.words_learned || (Array.isArray(row.learned_words) ? row.learned_words.length : 0));
    const quiz = Number(row.quiz_completed || 0);
    const best = Number(row.best_quiz || 0);
    const percent = activeGrade === 2 ? Math.round(words / 300 * 100) : Math.min(100, Math.round(words / 50 * 100));
    const level = best >= 90 ? '🏆' : best >= 70 ? '🌟' : words >= 100 ? '🔥' : '⭐';

    if(typeof window.setProgress === 'function'){
      window.setProgress(words, quiz, Math.min(100,percent), level);
    }else{
      const wordsEl=document.getElementById('words-count');
      const quizEl=document.getElementById('quiz-count');
      const percentEl=document.getElementById('progress-percent');
      const levelEl=document.getElementById('student-level');
      const bar=document.getElementById('progress-bar');
      if(wordsEl) wordsEl.textContent=words;
      if(quizEl) quizEl.textContent=quiz;
      if(percentEl) percentEl.textContent=Math.min(100,percent)+'%';
      if(levelEl) levelEl.textContent=level;
      if(bar) bar.style.width=Math.min(100,percent)+'%';
    }
  }

  async function loadTeacherProgress(){
    if(!path.includes('teacher-dashboard.html')) return;
    const cards = [...document.querySelectorAll('.student-card')];
    if(!cards.length) return;
    const ids = cards.map(card=>{
      const text = card.querySelector('.small')?.textContent || '';
      const m=text.match(/[0-9a-f]{8}-[0-9a-f-]{27,}/i);
      return m ? m[0] : null;
    }).filter(Boolean);
    if(!ids.length) return;

    const {data,error}=await client
      .from('student_progress')
      .select('user_id,grade,words_learned,quiz_completed,best_quiz,learned_words,updated_at')
      .in('user_id',ids)
      .in('grade',[2,3,4]);
    if(error){console.warn('Teacher progress read error:',error);return;}

    const byStudent=new Map();
    (data||[]).forEach(row=>{
      const k=String(row.user_id);
      const old=byStudent.get(k);
      if(!old || new Date(row.updated_at||0)>new Date(old.updated_at||0)) byStudent.set(k,row);
    });

    cards.forEach(card=>{
      const text=card.querySelector('.small')?.textContent || '';
      const m=text.match(/[0-9a-f]{8}-[0-9a-f-]{27,}/i);
      if(!m) return;
      const row=byStudent.get(m[0]);
      if(!row) return;
      const words=Number(row.words_learned || (Array.isArray(row.learned_words)?row.learned_words.length:0));
      const quiz=Number(row.quiz_completed||0);
      const best=Number(row.best_quiz||0);
      let box=card.querySelector('.progress-sync-badge');
      if(!box){
        box=document.createElement('div');
        box.className='progress-sync-badge';
        box.style.cssText='margin-top:10px;padding:8px 10px;border:1px solid #00eaff33;border-radius:10px;background:#031a32;color:#dffaff;font-size:12px;font-weight:800;';
        card.querySelector('.student-name')?.parentElement?.appendChild(box);
      }
      box.textContent=`📊 Progress: ${words} words • ${quiz} quizzes • Best ${best}%`;
    });
  }

  async function boot(){
    if(currentGrade){
      await syncCurrentGrade();
      watchLocalChanges();
    }
    if(path.includes('academy.html')){
      setTimeout(loadAcademyProgress,1200);
      setTimeout(loadAcademyProgress,3000);
    }
    if(path.includes('teacher-dashboard.html')){
      setTimeout(loadTeacherProgress,1200);
      setTimeout(loadTeacherProgress,3500);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.ENGLISH_MARIAMI_PROGRESS_SYNC={
    loadGrade,
    saveGrade,
    syncCurrentGrade,
    loadAcademyProgress,
    loadTeacherProgress
  };
})();
