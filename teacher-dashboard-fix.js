/* English with Mariami — Teacher Dashboard hotfix
   Fixes the legacy inline dashboard without touching student data.
   Requires config.js + Supabase client.
*/
(function(){
  'use strict';
  if (!location.pathname.toLowerCase().endsWith('/teacher-dashboard.html')) return;

  const DB = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient || window.supabase;
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const topics = {
    2:[['🔤','Alphabet','Alphabet & Sounds','Letters, pronunciation and spelling'],['🔢','Numbers','Numbers','1–100, counting and simple math'],['🎨','Colors','Colors','Colors and descriptions'],['👨‍👩‍👧','Family','Family','Family members and relationships'],['🐶','Animals','Animals','Pets and wild animals'],['🍎','Food','Food & Drinks','Food and drinks'],['🏫','School','School Life','Classroom English'],['🏠','Home','My Home','Rooms and furniture'],['👕','Clothes','Clothing','Clothes and outfits'],['👤','Body','Body Parts','Body vocabulary'],['🌳','Nature','Nature','Nature and environment'],['📅','Days','Days & Months','Calendar vocabulary'],['😊','Feelings','Feelings','Basic emotions'],['🏃','Actions','Actions','Everyday verbs'],['🍽️','Meals','Meals','Breakfast, lunch and dinner'],['🚗','Transport','Transport','Cars, buses, trains and planes'],['🏙️','Places','Places','Common places'],['🌦️','Weather','Weather','Weather vocabulary'],['🧸','Toys','Toys','Toys and games'],['📖','Reading','Reading Lab','Short reading practice'],['✏️','Grammar','Grammar','To be, have, can and plurals'],['🗣️','Speaking','Speaking','Simple conversations'],['🎧','Listening','Listening','Basic listening'],['🎯','Quiz','Quiz Challenge','Vocabulary and grammar challenge']],
    3:[['📚','Vocabulary','Vocabulary','Everyday English'],['🏫','School Life','School','School and classroom English'],['👥','People','People','Descriptions and relationships'],['🏠','My Home','Home','Rooms and furniture'],['🍕','Food & Drinks','Food','Meals and preferences'],['🛍️','Shopping','Shopping','Prices and conversations'],['🚌','Transport','Transport','Travel and directions'],['🌍','Countries','World English','Countries and nationalities'],['🌦️','Weather','Weather','Seasons and forecasts'],['⏰','Time','Time','Clock and routines'],['🏃','Daily Actions','Daily Routine','Present simple actions'],['❤️','Feelings','Emotions','Feelings and opinions'],['🐾','Animals','Animals','Wild and domestic animals'],['🌳','Nature','Environment','Nature and environment'],['📖','Reading','Reading Lab','Stories and questions'],['✏️','Grammar','Grammar','Present simple and continuous'],['🗣️','Speaking','Speaking','Conversation practice'],['🎧','Listening','Listening','Listening comprehension'],['💻','Technology','Technology','Digital vocabulary'],['🎯','Quiz','Mixed Challenge','Mixed vocabulary challenge']],
    4:[['🚀','Vocabulary Mastery','Vocabulary','High-frequency vocabulary'],['🧠','Smart Grammar','Grammar','Core English grammar'],['📖','Reading Lab','Reading','Reading comprehension'],['✍️','Writing Lab','Writing','Sentences and paragraphs'],['🗣️','Speaking','Speaking','Conversation practice'],['🎧','Listening','Listening','Spoken English'],['🌍','World English','Culture','Countries and cultures'],['🏫','Education','Education','School and learning'],['💼','Future Jobs','Jobs','Jobs and ambitions'],['🛒','Shopping','Shopping','Real-life conversations'],['✈️','Travel','Travel','Airport, hotel and directions'],['🍽️','Restaurant','Restaurant','Ordering food'],['❤️','Emotions','Emotions','Advanced feelings'],['🌦️','Weather','Climate','Climate and nature'],['🔬','Science','Science','Science vocabulary'],['💻','Technology','Technology','Computers and internet'],['🎨','Creative English','Creativity','Creative descriptions'],['🌎','Environment','Environment','Planet and environment'],['🏆','Challenge','Challenge','Advanced challenge'],['🎯','Final Quiz','Final Quiz','Complete Grade 4 challenge']]
  };

  function toast(text, type){
    const el=$('toast'); if(!el) return;
    el.textContent=text; el.className='toast show '+(type||'');
    clearTimeout(toast.t); toast.t=setTimeout(()=>el.className='toast',3000);
  }

  async function assignGrade(uid, grade){
    if(!uid) return;
    try{
      const r=await DB.rpc('teacher_assign_student_grade',{p_student_id:uid,p_grade:Number(grade)});
      if(r.error) throw r.error;
      toast('✅ '+gradeName(grade)+' მიენიჭა','ok');
      if(typeof window.teacherDashboard?.reloadStudents==='function') await window.teacherDashboard.reloadStudents();
      else if(typeof window.loadStudents==='function') await window.loadStudents();
    }catch(e){ console.error(e); toast('❌ კლასის მინიჭება ვერ მოხერხდა: '+(e.message||e),'err'); }
  }
  window.assignGrade=assignGrade;

  async function addStudent(){
    const email=($('studentEmail')?.value||'').trim();
    const grade=Number($('studentGrade')?.value||2);
    if(!email) return toast('მიუთითე Student Email','err');
    try{
      const r=await DB.rpc('teacher_assign_student_by_email',{p_email:email,p_grade:grade});
      if(r.error) throw r.error;
      $('studentEmail').value='';
      toast('✅ მოსწავლე დაემატა / კლასი მიენიჭა','ok');
      if(typeof window.loadStudents==='function') await window.loadStudents();
    }catch(e){ console.error(e); toast('❌ '+(e.message||e),'err'); }
  }
  window.addStudent=addStudent;
  $('addStudentBtn')?.addEventListener('click',e=>{e.preventDefault();addStudent();});

  async function loadTopicState(grade){
    const r=await DB.from('topic_controls').select('topic_key,enabled').eq('grade',grade);
    if(r.error) throw r.error;
    return new Map((r.data||[]).map(x=>[x.topic_key,!!x.enabled]));
  }

  async function setTopic(grade,title,enabled){
    const user=(await DB.auth.getUser()).data.user;
    if(!user) throw new Error('სესია აღარ არის აქტიური');
    const r=await DB.from('topic_controls').upsert({grade,topic_key:title,topic_name:title,enabled,teacher_id:user.id,updated_at:new Date().toISOString()},{onConflict:'grade,topic_key'});
    if(r.error) throw r.error;
  }

  async function renderTopics(){
    const grade=Number($('topicGrade')?.value||2), grid=$('topicsGrid');
    if(!grid) return;
    grid.innerHTML='<div class="loading">⏳ თემები იტვირთება...</div>';
    try{
      const state=await loadTopicState(grade), list=topics[grade]||[];
      if($('topicCount')) $('topicCount').textContent=list.length;
      grid.innerHTML=list.map((t,i)=>{
        const enabled=state.has(t[1])?state.get(t[1]):true;
        return `<div class="topic ${enabled?'':'disabled'}"><div class="topic-number">#${String(i+1).padStart(2,'0')}</div><div class="topic-icon">${t[0]}</div><div class="topic-title">${esc(t[1])}</div><div class="topic-en">${esc(t[2])}</div><div class="topic-desc">${esc(t[3])}</div><div class="topic-controls"><button class="btn primary" data-material="${esc(t[1])}" data-grade="${grade}">📚 მასალები</button><button class="topic-toggle ${enabled?'on':''}" data-topic-toggle="${esc(t[1])}" data-grade="${grade}"><span></span></button></div><div class="topic-state ${enabled?'state-on':'state-off'}">${enabled?'● ACTIVE':'● LOCKED'}</div></div>`;
      }).join('');
      grid.querySelectorAll('[data-topic-toggle]').forEach(b=>b.onclick=async()=>{try{await setTopic(Number(b.dataset.grade),b.dataset.topicToggle,!b.classList.contains('on'));await renderTopics();toast('✅ Topic Control განახლდა','ok');}catch(e){toast('❌ '+(e.message||e),'err');}});
      grid.querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>openMaterial(b.dataset.material,Number(b.dataset.grade)));
      $('topicConnectionStatus') && ($('topicConnectionStatus').textContent='SUPABASE');
    }catch(e){
      console.error(e); grid.innerHTML='<div class="empty">❌ Topic Control ვერ ჩაიტვირთა.<br><small>'+esc(e.message||e)+'</small></div>';
      $('topicConnectionStatus') && ($('topicConnectionStatus').textContent='ERROR');
    }
  }
  window.renderTopics=renderTopics;

  async function openMaterial(title,grade){
    const topic=(topics[grade]||[]).find(x=>x[1]===title);
    if(!topic) return;
    const modal=$('detailModal'), body=$('detailBody');
    if(!modal||!body) return;
    $('detailTitle').textContent='📚 '+title+' • Grade '+grade;
    body.innerHTML=`<div class="detail-grid"><div class="detail-stat"><small>GRADE</small><b>${grade}</b></div><div class="detail-stat"><small>TOPIC</small><b>${esc(title)}</b></div><div class="detail-stat"><small>STATUS</small><b style="color:var(--green)">READY</b></div></div><div class="chart"><h3>🎯 ${esc(topic[2])}</h3><p class="muted">${esc(topic[3])}</p></div><div class="chart"><h3>📖 Lesson Materials</h3><div class="topic-material-grid"><button class="btn primary" onclick="teacherMaterial('Vocabulary','${esc(title)}',${grade})">🧠 Vocabulary</button><button class="btn purple" onclick="teacherMaterial('Grammar','${esc(title)}',${grade})">✏️ Grammar</button><button class="btn green" onclick="teacherMaterial('Speaking','${esc(title)}',${grade})">🗣️ Speaking</button><button class="btn yellow" onclick="teacherMaterial('Quiz','${esc(title)}',${grade})">🎯 Quiz</button><button class="btn primary" onclick="teacherMaterial('Reading','${esc(title)}',${grade})">📖 Reading</button><button class="btn purple" onclick="teacherMaterial('Homework','${esc(title)}',${grade})">📝 Homework</button></div></div>`;
    modal.classList.add('open');
  }

  window.teacherMaterial=function(type,topic,grade){
    const body=$('detailBody'); if(!body) return;
    const text={Vocabulary:'Learn key words, pronunciation, spelling and example sentences.',Grammar:'Study the grammar rule, read examples and build your own sentences.',Speaking:'Practice questions, answers and short conversations.',Quiz:'Vocabulary + grammar challenge with a final score.',Reading:'Read the text, find new words and answer comprehension questions.',Homework:'Review vocabulary, write sentences and prepare for the next lesson.'}[type]||'Lesson material';
    body.innerHTML=`<div class="chart"><div class="kicker">GRADE ${grade} • ${esc(topic)}</div><h2>${type}</h2><p style="white-space:pre-line;line-height:1.9">${esc(text)}</p><button class="btn gray" onclick="renderTopics()">← Topics</button></div>`;
  };

  $('topicGrade')?.addEventListener('change',renderTopics);
  $('enableAllTopics')?.addEventListener('click',async()=>{const g=Number($('topicGrade').value);for(const t of (topics[g]||[])) await setTopic(g,t[1],true);await renderTopics();toast('✅ ყველა Topic ჩართულია','ok');});
  $('disableAllTopics')?.addEventListener('click',async()=>{const g=Number($('topicGrade').value);if(!confirm('ყველა თემა გაითიშოს?')) return;for(const t of (topics[g]||[])) await setTopic(g,t[1],false);await renderTopics();toast('🔒 ყველა Topic გაითიშა');});

  /* Correct legacy attendance writer to the actual schema. */
  window.saveAttendance=async function(uid,status){
    try{
      const teacher=(await DB.auth.getUser()).data.user;
      const date=$('attendanceDate')?.value || new Date().toISOString().slice(0,10);
      const q=await DB.from('schedules').select('id,student_id').eq('teacher_id',teacher.id).eq('student_id',uid).eq('lesson_date',date).order('start_time',{ascending:false}).limit(1);
      if(q.error) throw q.error;
      const lesson=q.data?.[0];
      if(!lesson) throw new Error('ამ თარიღზე ამ მოსწავლისთვის გაკვეთილი ჯერ არ არის შექმნილი.');
      const existing=await DB.from('attendance').select('id').eq('schedule_id',lesson.id).eq('teacher_id',teacher.id).maybeSingle();
      if(existing.error) throw existing.error;
      const payload={schedule_id:lesson.id,student_id:uid,teacher_id:teacher.id,status,arrival_time:status==='absent'?null:new Date().toISOString()};
      let r=existing.data?.id?await DB.from('attendance').update(payload).eq('id',existing.data.id):await DB.from('attendance').insert(payload);
      if(r.error) throw r.error;
      toast('✅ დასწრება შენახულია','ok');
    }catch(e){console.error(e);toast('❌ '+(e.message||e),'err');}
  };

  function boot(){renderTopics();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
