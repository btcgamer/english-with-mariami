/* English with Mariami — deterministic Magic Achievement Engine */
(function(){
  'use strict';
  if(!/academy\.html$/i.test(location.pathname))return;
  const achievements=[
    ['first-word','📖','FIRST WORD','Learn your first word',s=>s.words>=1],
    ['word-seeker','📚','WORD SEEKER','Learn 25 words',s=>s.words>=25],
    ['word-master','🧠','WORD MASTER','Learn 100 words',s=>s.words>=100],
    ['first-quiz','🎯','QUIZ CASTER','Complete your first quiz',s=>s.quizzes>=1],
    ['score-master','🏆','SCORE MASTER','Reach 90% on a quiz',s=>s.best>=90],
    ['academy-hero','👑','ACADEMY HERO','Learn 250 words + complete 10 quizzes',s=>s.words>=250&&s.quizzes>=10]
  ];
  const n=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0;
  async function stats(){
    let words=0,quizzes=0,best=0;
    const api=window.ENGLISH_MARIAMI_PROGRESS_SYNC;
    if(api&&typeof api.loadGrade==='function'){
      for(const g of [2,3,4]){try{const r=await api.loadGrade(g);if(r){words+=n(r.words_learned);quizzes+=n(r.quiz_completed);best=Math.max(best,n(r.best_quiz||r.score))}}catch(_){}}
    }
    if(!words&&!quizzes){for(const g of [2,3,4]){try{const a=JSON.parse(localStorage.getItem(`grade${g}LearnedWords`)||'[]');words+=Array.isArray(a)?new Set(a.map(String)).size:0}catch(_){}quizzes+=n(localStorage.getItem(`grade${g}QuizAttempts`));best=Math.max(best,n(localStorage.getItem(`grade${g}BestScore`)))}}
    return {words,quizzes,best};
  }
  async function render(){
    const root=document.querySelector('.magic-command-center');if(!root)return;
    const s=await stats();let box=root.querySelector('.magic-achievement-engine');
    if(!box){box=document.createElement('div');box.className='magic-achievement-engine';root.appendChild(box)}
    const earned=achievements.filter(a=>a[3]&&a[3]&&a[4](s)).length;
    box.innerHTML=`<div class="magic-achievement-title"><span>🏅</span><div><small>MAGIC ACHIEVEMENTS</small><strong>${earned}/${achievements.length} UNLOCKED</strong></div></div><div class="magic-achievement-grid">${achievements.map(a=>{const ok=a[4](s);return `<article class="magic-achievement ${ok?'is-earned':'is-locked'}" data-achievement="${a[0]}"><span>${a[1]}</span><div><b>${a[2]}</b><small>${a[3]}</small></div><i>${ok?'✓':'🔒'}</i></article>`}).join('')}</div>`;
  }
  const boot=()=>{render();setInterval(render,15000);window.addEventListener('englishMariamiProgressUpdated',render)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
