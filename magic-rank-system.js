/* English with Mariami — Magic Rank System */
(function(){
  'use strict';
  if(!/academy\.html$/i.test(location.pathname)) return;
  const rankNames=['NOVICE','EXPLORER','SPELLCASTER','LANGUAGE MAGE','ACADEMY MASTER'];
  const rankIcons=['🌱','🧭','🔮','🧙‍♂️','👑'];
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function read(n,d=0){const v=Number(localStorage.getItem(n));return Number.isFinite(v)?v:d}
  function getStats(){
    const grades=[2,3,4];
    let words=0,quizzes=0,best=0;
    grades.forEach(g=>{
      try{const a=JSON.parse(localStorage.getItem(`grade${g}LearnedWords`)||'[]');if(Array.isArray(a))words+=new Set(a.map(String)).size}catch(_){ }
      quizzes+=Math.max(0,read(`grade${g}QuizAttempts`));
      best=Math.max(best,clamp(read(`grade${g}BestScore`),0,100));
    });
    return {words,quizzes,best};
  }
  function rankFor(xp){const i=clamp(Math.floor(xp/500),0,4);return {i,name:rankNames[i],icon:rankIcons[i],base:i*500,next:i<4?(i+1)*500:2500}}
  function render(){
    const root=document.querySelector('.magic-command-center');if(!root)return;
    const s=getStats();
    const xp=s.words*10+s.quizzes*40+s.best*2;
    const r=rankFor(xp), progress=r.i===4?100:Math.round(clamp((xp-r.base)/(r.next-r.base)*100,0,100));
    let panel=root.querySelector('.magic-rank-panel');
    if(!panel){panel=document.createElement('section');panel.className='magic-rank-panel';panel.setAttribute('aria-label','Magic Academy rank and XP');root.appendChild(panel)}
    panel.innerHTML=`<div class="magic-rank-head"><span class="magic-rank-icon" aria-hidden="true">${r.icon}</span><div><small>MAGIC RANK</small><strong>${r.name}</strong></div><b>${xp.toLocaleString()} XP</b></div><div class="magic-xp-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><i style="width:${progress}%"></i></div><div class="magic-rank-meta"><span>${r.i===4?'MAX RANK':'Next rank: '+r.next.toLocaleString()+' XP'}</span><span>${progress}%</span></div><div class="magic-badges"><span class="${s.words>=25?'earned':''}">📚 Word Seeker</span><span class="${s.quizzes>=1?'earned':''}">🎯 Quiz Caster</span><span class="${s.best>=90?'earned':''}">🏆 Score Master</span></div>`;
  }
  function boot(){render();setInterval(render,2000);window.addEventListener('englishMariamiProgressUpdated',render)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
