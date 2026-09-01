/* English with Mariami — Grade 2 Mega Practice
   Safe additive layer: builds a practice game from the shared Mega Vocabulary UI.
   No auth or Supabase writes. Progress is stored locally and announced via grade2progress.
*/
(()=>{
  'use strict';
  const KEY='grade2_mega_practice_v1';
  const fallback=[
    ['cat','კატა'],['dog','ძაღლი'],['apple','ვაშლი'],['banana','ბანანი'],
    ['red','წითელი'],['blue','ლურჯი'],['mother','დედა'],['father','მამა'],
    ['house','სახლი'],['school','სკოლა'],['water','წყალი'],['book','წიგნი'],
    ['run','სირბილი'],['jump','ხტომა'],['happy','ბედნიერი'],['big','დიდი']
  ];
  let data=[];
  let state={xp:0,correct:0,attempts:0};
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function load(){try{state=Object.assign(state,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){};document.dispatchEvent(new CustomEvent('grade2progress',{detail:state}))}
  function collect(){
    const cards=[...document.querySelectorAll('[class*="mv-card"], [class*="vocab-card"]')];
    const found=cards.map(c=>{
      const b=c.querySelector('b,strong,.mv-word,.word');
      const k=c.querySelector('.ka,.mv-ka');
      return b&&k?[b.textContent.trim(),k.textContent.trim()]:null;
    }).filter(Boolean);
    data=found.length>=6?found:fallback;
    data=[...new Map(data.map(x=>[x[0].toLowerCase(),x])).values()];
  }
  function open(){
    collect();
    const old=document.getElementById('g2MegaPractice');
    if(old)old.remove();
    const box=document.createElement('div');
    box.id='g2MegaPractice';
    box.innerHTML='<div class="g2mp-head"><span>⚡ MEGA PRACTICE</span><small>Extra Vocabulary Challenge</small></div><div class="g2mp-q" id="g2mpQ"></div><div class="g2mp-answers" id="g2mpA"></div><div class="g2mp-score" id="g2mpS"></div>';
    document.body.appendChild(box);
    box.querySelector('.g2mp-head').addEventListener('click',()=>box.classList.toggle('min'));
    next();
  }
  function next(){
    const box=document.getElementById('g2MegaPractice'); if(!box)return;
    const item=data[Math.floor(Math.random()*data.length)];
    const pool=[item[1],...data.filter(x=>x!==item).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1])].sort(()=>Math.random()-.5);
    box.querySelector('#g2mpQ').innerHTML='<b>What is:</b> <span>'+esc(item[0])+'</span>';
    box.querySelector('#g2mpA').innerHTML=pool.map(a=>'<button data-a="'+esc(a)+'">'+esc(a)+'</button>').join('');
    box.querySelector('#g2mpA').querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
      state.attempts++;
      const ok=btn.dataset.a===item[1];
      if(ok){state.correct++;state.xp+=5;btn.classList.add('ok');}
      else btn.classList.add('bad');
      save();
      box.querySelector('#g2mpS').textContent=(ok?'✅ Correct! +5 XP':'❌ Try again')+' • Score '+state.correct+'/'+state.attempts+' • +'+state.xp+' XP';
      setTimeout(next,650);
    });
  }
  function boot(){
    load();
    const style=document.createElement('style');
    style.textContent='#g2MegaPractice{position:fixed;right:18px;bottom:18px;width:min(360px,calc(100vw - 36px));z-index:2147483646;padding:16px;border:1px solid rgba(100,240,255,.45);border-radius:18px;background:rgba(3,8,25,.96);box-shadow:0 0 35px rgba(0,220,255,.22);color:#fff;font:14px Arial,sans-serif;backdrop-filter:blur(14px)}#g2MegaPractice.min{height:44px;overflow:hidden}.g2mp-head{display:flex;justify-content:space-between;gap:10px;cursor:pointer}.g2mp-head span{font-weight:900}.g2mp-head small{opacity:.7}.g2mp-q{margin:14px 0;font-size:18px}.g2mp-q span{display:block;margin-top:5px;font-size:26px}.g2mp-answers{display:grid;grid-template-columns:1fr 1fr;gap:8px}.g2mp-answers button{padding:10px;border-radius:11px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#fff;cursor:pointer}.g2mp-answers button.ok{background:rgba(0,220,150,.35)}.g2mp-answers button.bad{background:rgba(255,70,100,.35)}.g2mp-score{margin-top:10px;opacity:.85}@media(max-width:700px){#g2MegaPractice{right:10px;bottom:10px;width:calc(100vw - 20px)}}';
    document.head.appendChild(style);
    const btn=document.createElement('button');
    btn.id='g2MegaPracticeLaunch';
    btn.type='button';
    btn.textContent='⚡ MEGA PRACTICE';
    btn.style.cssText='position:fixed;right:18px;bottom:18px;z-index:2147483645;padding:12px 16px;border-radius:14px;border:1px solid rgba(100,240,255,.45);background:rgba(3,8,25,.94);color:#fff;font-weight:800;cursor:pointer;box-shadow:0 0 24px rgba(0,220,255,.2)';
    btn.onclick=open;
    document.body.appendChild(btn);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
