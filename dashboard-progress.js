/* English with Mariami — Grade 2/3/4 dashboard progress panels */
(function(){
  'use strict';
  const db=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!db) return;
  const path=(location.pathname||'').toLowerCase();
  const isTeacher=path.includes('teacher-dashboard.html');
  const isStudent=path.includes('academy.html');
  if(!isTeacher&&!isStudent) return;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const pct=(words,grade)=>Math.min(100,Math.round(Number(words||0)/(grade===2?300:grade===3?250:250)*100));
  const gradeName=g=>g===2?'🌱 Grade 2':g===3?'🚀 Grade 3':'⭐ Grade 4';
  const cardHtml=(r,g)=>{
    const row=r||{};
    const words=Number(row.words_learned||0);
    const quizzes=Number(row.quiz_completed||0);
    const best=Number(row.best_quiz||row.score||0);
    const p=pct(words,g);
    const active=row.updated_at?new Date(row.updated_at).toLocaleDateString('ka-GE'): '—';
    return `<div class="emp-grade-progress"><div class="egp-head"><b>${gradeName(g)}</b><span>${p}%</span></div><div class="egp-bar"><i style="width:${p}%"></i></div><div class="egp-grid"><span>📚 <b>${words}</b> სიტყვა</span><span>📝 <b>${quizzes}</b> Quiz</span><span>🏆 <b>${best}%</b> Best</span><span>🕒 ${esc(active)}</span></div></div>`;
  };
  function css(){
    if(document.getElementById('emp-progress-css'))return;
    const s=document.createElement('style');s.id='emp-progress-css';
    s.textContent=`
      .emp-progress-panel{margin:0 0 20px;padding:22px;border:1px solid #00eaff35;border-radius:23px;background:linear-gradient(145deg,#082642e8,#020d1eea);box-shadow:0 24px 70px #0007,inset 0 1px #fff09;}
      .emp-progress-title{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap}.emp-progress-title h2{margin:0;font-size:24px}.emp-progress-title span{color:#9dbdca;font-size:12px}
      .emp-student-progress{border:1px solid #00eaff22;border-radius:18px;background:#04162bbd;padding:15px;margin-top:12px}.emp-student-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px}.emp-student-head b{font-size:17px}.emp-student-head small{color:#9dbdca}.emp-grade-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.emp-grade-progress{padding:13px;border-radius:15px;background:#061d38;border:1px solid #00eaff22}.egp-head{display:flex;justify-content:space-between;gap:8px;margin-bottom:9px}.egp-head span{color:#ffe600;font-weight:1000}.egp-bar{height:7px;border-radius:20px;background:#010b18;overflow:hidden}.egp-bar i{display:block;height:100%;background:linear-gradient(90deg,#0874ff,#00eaff,#ffe600);border-radius:20px}.egp-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px;color:#9fc0cb;font-size:11px}.egp-grid b{color:#fff}.emp-refresh{border:1px solid #00eaff33;background:#071e38;color:#fff;padding:8px 11px;border-radius:10px;font-weight:900;cursor:pointer}.emp-empty{padding:25px;text-align:center;color:#7896a4;border:1px dashed #00eaff25;border-radius:15px}
      @media(max-width:800px){.emp-grade-grid{grid-template-columns:1fr}.emp-progress-panel{padding:16px}}
    `;document.head.appendChild(s);
  }
  async function user(){const r=await db.auth.getUser();return r.data?.user||null;}
  async function getProgress(ids){
    if(!ids.length)return [];
    const r=await db.from('student_progress').select('user_id,grade,words_learned,quiz_completed,best_quiz,score,updated_at').in('user_id',ids).in('grade',[2,3,4]);
    if(r.error){console.warn('Dashboard progress error',r.error);return []}return r.data||[];
  }
  function panel(){
    const el=document.createElement('section');el.id='emp-progress-panel';el.className='emp-progress-panel';
    el.innerHTML='<div class="emp-progress-title"><div><h2>📊 Grade 2 / 3 / 4 Progress</h2><span>რეალური Supabase მონაცემები • ავტომატური განახლება</span></div><button class="emp-refresh" id="emp-progress-refresh">🔄 განახლება</button></div><div id="emp-progress-body"><div class="emp-empty">იტვირთება...</div></div>';
    return el;
  }
  async function renderTeacher(){
    const p=document.getElementById('emp-progress-panel');if(!p)return;
    const body=p.querySelector('#emp-progress-body');body.innerHTML='<div class="emp-empty">⏳ პროგრესი იტვირთება...</div>';
    const me=await user();if(!me){body.innerHTML='<div class="emp-empty">შესვლა საჭიროა.</div>';return}
    const links=await db.from('teacher_students').select('student_id').eq('teacher_id',me.id);
    if(links.error){body.innerHTML='<div class="emp-empty">პროგრესის წაკითხვა ვერ მოხერხდა.</div>';return}
    const ids=(links.data||[]).map(x=>x.student_id);if(!ids.length){body.innerHTML='<div class="emp-empty">ჯერ არცერთი მოსწავლე არ არის მიბმული.</div>';return}
    const pr=await getProgress(ids);
    const prof=await db.from('profiles').select('user_id,full_name,grade').in('user_id',ids);
    const pm=new Map((prof.data||[]).map(x=>[x.user_id,x]));
    body.innerHTML=ids.map(id=>{const s=pm.get(id)||{};const rows=pr.filter(x=>x.user_id===id);const rm=new Map(rows.map(x=>[Number(x.grade),x]));return `<div class="emp-student-progress"><div class="emp-student-head"><b>👤 ${esc(s.full_name||'მოსწავლე')}</b><small>მიმდინარე კლასი: ${s.grade?esc('Grade '+s.grade):'—'}</small></div><div class="emp-grade-grid">${[2,3,4].map(g=>cardHtml(rm.get(g),g)).join('')}</div></div>`}).join('');
  }
  async function renderStudent(){
    const p=document.getElementById('emp-progress-panel');if(!p)return;
    const body=p.querySelector('#emp-progress-body');const me=await user();if(!me){body.innerHTML='<div class="emp-empty">შესვლა საჭიროა.</div>';return}
    const rows=await getProgress([me.id]);const rm=new Map(rows.map(x=>[Number(x.grade),x]));
    const prof=await db.from('profiles').select('grade').eq('user_id',me.id).maybeSingle();
    body.innerHTML=`<div class="emp-student-progress"><div class="emp-student-head"><b>🎓 ჩემი სასწავლო პროგრესი</b><small>მიმდინარე კლასი: ${prof.data?.grade?'Grade '+esc(prof.data.grade):'—'}</small></div><div class="emp-grade-grid">${[2,3,4].map(g=>cardHtml(rm.get(g),g)).join('')}</div></div>`;
  }
  async function boot(){
    css();const target=isTeacher?(document.querySelector('main.wrap')||document.querySelector('main')):(document.querySelector('main')||document.body);if(!target)return;
    const old=document.getElementById('emp-progress-panel');if(old)old.remove();const p=panel();target.insertBefore(p,target.firstChild);
    p.querySelector('#emp-progress-refresh').onclick=()=>isTeacher?renderTeacher():renderStudent();
    if(isTeacher)await renderTeacher();else await renderStudent();
    setInterval(()=>isTeacher?renderTeacher():renderStudent(),15000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900),{once:true});else setTimeout(boot,900);
})();
