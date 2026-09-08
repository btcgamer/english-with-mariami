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
    if(n){
      n.textContent=text;
      n.className='notice show '+(error?'err':'ok');
      clearTimeout(n.__ewmTimer);
      n.__ewmTimer=setTimeout(function(){n.className='notice';},4500);
    }
    if(error) console.error('[Teacher Dashboard Fix]',text);
  }

  function refresh(){
    const b=document.getElementById('studentToolsRefresh')||document.getElementById('refreshStudents');
    if(b) b.click(); else location.reload();
  }

  async function findStudentIdFromCard(button){
    const db=getDB();
    if(!db) throw new Error('Supabase client ვერ მოიძებნა.');
    const card=button.closest('.student-manage-card,.assignment-card,.student');
    const nameEl=card?.querySelector('.student-name');
    const raw=String(nameEl?.textContent||'').replace(/^🧑‍🎓\s*/,'').trim();
    if(!raw) throw new Error('მოსწავლის სახელი ვერ მოიძებნა.');
    const {data,error}=await db.from('profiles').select('user_id,full_name').eq('role','student').eq('full_name',raw).limit(2);
    if(error) throw error;
    if(!data?.length) throw new Error('მოსწავლე ბაზაში ვერ მოიძებნა.');
    if(data.length>1) throw new Error('ამ სახელით ერთზე მეტი მოსწავლეა. წაშლა უსაფრთხოდ ვერ განისაზღვრა.');
    return data[0].user_id;
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
    const b=e.target.closest?.('[data-act],.delete-btn,.reset-btn');
    if(!b) return;

    const act=b.dataset.act || (b.classList.contains('delete-btn')?'remove':'reset');
    if(act!=='reset'&&act!=='remove') return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if(b.disabled) return;

    let id=String(b.dataset.id||'').trim();
    b.disabled=true;
    const old=b.textContent;
    b.textContent='⏳ მუშავდება...';

    try{
      await getCurrentUser();
      if(!id) id=await findStudentIdFromCard(b);

      if(act==='reset'){
        if(!window.confirm('ნამდვილად გინდა ამ მოსწავლის განულება?')) return;
        await resetStudent(id);
      }else{
        const card=b.closest('.student-manage-card,.assignment-card,.student');
        const name=String(card?.querySelector('.student-name')?.textContent||'მოსწავლე').replace(/^🧑‍🎓\s*/,'').trim();
        if(!window.confirm(`ნამდვილად გინდა „${name}“-ის სრულად ამოღება? ეს წაშლის მის ანგარიშსა და დაკავშირებულ სასწავლო მონაცემებს.`)) return;
        await deleteStudent(id);
      }
    }catch(err){
      console.error('[Teacher Dashboard Fix]',err);
      message(err?.message||'ოპერაცია ვერ შესრულდა.',true);
    }finally{
      b.disabled=false;
      b.textContent=old;
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
