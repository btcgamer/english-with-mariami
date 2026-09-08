/* English with Mariami — Teacher Dashboard safe action bridge. */
(function(){
  'use strict';

  if(!/\/teacher-dashboard\.html(?:$|[?#])/i.test(location.pathname+location.search+location.hash)) return;

  function getDB(){
    return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null;
  }

  async function getCurrentUser(){
    const db=getDB();
    if(!db?.auth?.getUser) throw new Error('Supabase client ვერ მოიძებნა.');
    const r=await db.auth.getUser();
    if(r.error) throw r.error;
    if(!r.data?.user) throw new Error('სესია ვადაგასულია. თავიდან შედი.');
    return r.data.user;
  }

  function message(text,error){
    const n=document.getElementById('notice');
    if(!n){ if(error) console.error(text); return; }
    n.textContent=text;
    n.className='notice show '+(error?'err':'ok');
    clearTimeout(n.__ewmTimer);
    n.__ewmTimer=setTimeout(function(){n.className='notice';},4500);
  }

  function refresh(){
    const b=document.getElementById('refreshStudents');
    if(b) b.click(); else location.reload();
  }

  async function resetStudent(id){
    const db=getDB();
    const r=await db.rpc('teacher_reset_student',{p_student_id:id});
    if(r.error) throw r.error;
    message('მოსწავლის კლასი და პროგრესის მდგომარეობა განულდა.');
    refresh();
  }

  async function deleteStudent(id){
    const db=getDB();
    const r=await db.rpc('teacher_delete_student',{p_student_id:id});
    if(r.error) throw r.error;
    message('მოსწავლე უსაფრთხოდ წაიშალა.');
    refresh();
  }

  document.addEventListener('click',async function(e){
    const b=e.target.closest?.('[data-act]');
    if(b && (b.dataset.act==='reset'||b.dataset.act==='remove')){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if(b.disabled) return;
      const id=String(b.dataset.id||'').trim();
      if(!id) return message('მოსწავლის ID ვერ მოიძებნა.',true);
      b.disabled=true;
      const old=b.textContent;
      b.textContent='⏳ მუშავდება...';
      try{
        await getCurrentUser();
        if(b.dataset.act==='reset'){
          if(!window.confirm('ნამდვილად გინდა ამ მოსწავლის განულება?')) return;
          await resetStudent(id);
        }else{
          if(!window.confirm('ნამდვილად გინდა ამ მოსწავლის სრულად ამოღება? ეს წაშლის მის ანგარიშსა და დაკავშირებულ სასწავლო მონაცემებს.')) return;
          await deleteStudent(id);
        }
      }catch(err){
        console.error('[Teacher Dashboard Fix]',err);
        message(err?.message||'ოპერაცია ვერ შესრულდა.',true);
      }finally{
        b.disabled=false;
        b.textContent=old;
      }
      return;
    }
  },true);

  /* Covers the dashboard's .sound buttons as well as generic listen controls. */
  document.addEventListener('click',function(e){
    const b=e.target.closest?.('.sound,[data-speak],[data-listen],[data-speech],button[aria-label*="listen" i]');
    if(!b) return;
    const text=b.dataset.speak||b.dataset.listen||b.dataset.speech||b.closest('.word,.phrase,.box')?.querySelector('b,span,p')?.textContent||b.textContent||'';
    if(!text.trim()||!('speechSynthesis' in window)) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text.trim());
    u.lang='en-US';
    u.rate=.82;
    u.pitch=1;
    u.volume=1;
    window.speechSynthesis.speak(u);
  },true);
})();
