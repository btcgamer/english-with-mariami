/* English with Mariami — Teacher student management controls */
(function(){
  'use strict';
  if(!location.pathname.toLowerCase().endsWith('/teacher-dashboard.html')) return;

  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  let client=null,teacherId=null,students=[];

  function toast(text,type='ok'){
    const box=document.getElementById('message');
    if(!box)return;
    box.textContent=text;
    box.className='message show '+(type==='error'?'error':'ok');
    clearTimeout(toast.t);
    toast.t=setTimeout(()=>box.className='message',5000);
  }

  async function init(){
    for(let i=0;i<50;i++){
      client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
      if(client)break;
      await wait(200);
    }
    if(!client)return;
    const {data:{session}}=await client.auth.getSession();
    if(!session)return;
    teacherId=session.user.id;
    const {data:profile}=await client.from('profiles').select('role').eq('user_id',teacherId).maybeSingle();
    if(String(profile?.role||'').toLowerCase()!=='teacher')return;
    install();
  }

  function install(){
    const list=document.getElementById('assignmentList');
    const panel=document.getElementById('students');
    if(!list||!panel)return;

    if(document.getElementById('studentManageTools')) return;
    const tools=document.createElement('div');
    tools.id='studentManageTools';
    tools.innerHTML=`
      <div class="student-tools">
        <input id="studentSearch" type="search" placeholder="🔎 მოძებნე მოსწავლე სახელით...">
        <select id="studentFilterGrade">
          <option value="all">🎓 ყველა კლასი</option>
          <option value="0">⏳ კლასი არ არის მინიჭებული</option>
          <option value="2">🌱 მე-2 კლასი</option>
          <option value="3">🚀 მე-3 კლასი</option>
          <option value="4">⭐ მე-4 კლასი</option>
        </select>
        <select id="studentFilterLink">
          <option value="all">👥 ყველა მოსწავლე</option>
          <option value="mine">ჩემი მოსწავლეები</option>
          <option value="unlinked">არ არის მიბმული მასწავლებელზე</option>
        </select>
        <button class="btn primary" id="studentToolsRefresh">🔄 განახლება</button>
      </div>
      <div class="student-tools-info" id="studentToolsInfo"></div>`;
    list.parentElement.insertBefore(tools,list);

    document.getElementById('studentSearch').addEventListener('input',render);
    document.getElementById('studentFilterGrade').addEventListener('change',render);
    document.getElementById('studentFilterLink').addEventListener('change',render);
    document.getElementById('studentToolsRefresh').addEventListener('click',load);

    document.getElementById('loadStudentsAdminBtn')?.addEventListener('click',()=>setTimeout(load,50));
    document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{
      if(b.dataset.tab==='students')setTimeout(load,80);
    }));

    load();
  }

  async function load(){
    const list=document.getElementById('assignmentList');
    if(!list||!client)return;
    list.innerHTML='<div class="muted">⏳ მოსწავლეები იტვირთება...</div>';
    try{
      const {data,error}=await client.from('profiles').select('user_id,full_name,grade,created_at').eq('role','student').order('created_at',{ascending:false});
      if(error)throw error;
      const ids=(data||[]).map(x=>x.user_id).filter(Boolean);
      let links=[];
      if(ids.length){
        const {data:d,error:e}=await client.from('teacher_students').select('teacher_id,student_id').in('student_id',ids);
        if(e)throw e;
        links=d||[];
      }
      const linkMap=new Map();
      links.forEach(x=>{if(!linkMap.has(x.student_id))linkMap.set(x.student_id,[]);linkMap.get(x.student_id).push(x.teacher_id)});
      students=(data||[]).map(s=>({...s,linkedTeachers:linkMap.get(s.user_id)||[]}));
      render();
    }catch(e){
      console.error(e);
      list.innerHTML='<div class="muted">მოსწავლეების ჩატვირთვა ვერ მოხერხდა.</div>';
      toast('მოსწავლეების ჩატვირთვისას შეცდომა მოხდა: '+(e.message||''),'error');
    }
  }

  function render(){
    const list=document.getElementById('assignmentList');
    const search=String(document.getElementById('studentSearch')?.value||'').trim().toLowerCase();
    const grade=String(document.getElementById('studentFilterGrade')?.value||'all');
    const link=String(document.getElementById('studentFilterLink')?.value||'all');
    let rows=students.filter(s=>{
      const name=String(s.full_name||'').toLowerCase();
      const g=Number(s.grade||0);
      const mine=s.linkedTeachers.includes(teacherId);
      const linked=s.linkedTeachers.length>0;
      return (!search||name.includes(search)) && (grade==='all'||g===Number(grade)) && (link==='all'||(link==='mine'&&mine)||(link==='unlinked'&&!linked));
    });
    const info=document.getElementById('studentToolsInfo');
    if(info)info.textContent=`ნაჩვენებია ${rows.length} / ${students.length} მოსწავლე`;
    if(!rows.length){list.innerHTML='<div class="muted">🔎 ამ ფილტრით მოსწავლე ვერ მოიძებნა.</div>';return;}
    list.innerHTML='';
    rows.forEach(s=>{
      const current=Number(s.grade||0);
      const mine=s.linkedTeachers.includes(teacherId);
      const card=document.createElement('div');
      card.className='assignment-card student-manage-card';
      card.innerHTML=`
        <div>
          <div class="student-name">🧑‍🎓 ${esc(s.full_name||'მოსწავლე')}</div>
          <div class="small">${current?`🎓 მე-${current} კლასი`:'⏳ კლასი არ არის მინიჭებული'} • ${mine?'ჩემი მოსწავლე':'არ არის ჩემს სიაში'}</div>
        </div>
        <select class="assignment-select">
          <option value="">აირჩიე კლასი</option>
          <option value="2">მე-2 კლასი</option>
          <option value="3">მე-3 კლასი</option>
          <option value="4">მე-4 კლასი</option>
        </select>
        <div class="student-manage-actions">
          <button class="btn primary assign-btn">${current?'🔄 შეცვლა':'🎓 მინიჭება'}</button>
          <button class="btn gray reset-btn">↩️ განულება</button>
          <button class="btn red delete-btn">🗑️ წაშლა</button>
        </div>`;
      const sel=card.querySelector('.assignment-select');
      if(current)sel.value=String(current);
      card.querySelector('.assign-btn').addEventListener('click',()=>assign(s.user_id,Number(sel.value),current));
      card.querySelector('.reset-btn').addEventListener('click',()=>resetStudent(s));
      card.querySelector('.delete-btn').addEventListener('click',()=>deleteStudent(s));
      list.appendChild(card);
    });
  }

  async function assign(id,grade,current){
    if(![2,3,4].includes(grade))return toast('აირჩიე მე-2, მე-3 ან მე-4 კლასი.','error');
    if(grade===current)return toast('ეს კლასი უკვე მინიჭებულია.','error');
    try{
      const {error}=await client.rpc('teacher_assign_student_grade',{p_student_id:id,p_grade:grade});
      if(error)throw error;
      toast(`✅ მოსწავლეს მიენიჭა მე-${grade} კლასი.`);
      await load();
    }catch(e){console.error(e);toast('კლასის მინიჭება ვერ მოხერხდა: '+(e.message||''),'error')}
  }

  async function resetStudent(s){
    if(!confirm(`ნამდვილად გინდა „${s.full_name||'მოსწავლის'}“ კლასის განულება?\n\nკლასი გახდება „არ არის მინიჭებული“ და მასწავლებელთან კავშირი მოიხსნება.`))return;
    try{
      const {error}=await client.rpc('teacher_reset_student',{p_student_id:s.user_id});
      if(error)throw error;
      toast('↩️ მოსწავლის კლასი განულდა.');
      await load();
    }catch(e){console.error(e);toast('განულება ვერ მოხერხდა: '+(e.message||''),'error')}
  }

  async function deleteStudent(s){
    const name=s.full_name||'მოსწავლე';
    const ok=confirm(`⚠️ ყურადღება!\n\nნამდვილად გინდა „${name}“-ის წაშლა?\n\nწაიშლება მისი პროფილი, მასწავლებლებთან კავშირი, გაკვეთილები, დასწრება და შეფასებები. ეს მოქმედება შეუქცევადია.`);
    if(!ok)return;
    const typed=prompt(`დადასტურებისთვის ჩაწერე მოსწავლის სახელი:\n${name}`);
    if(typed!==name)return toast('წაშლა გაუქმდა — სახელი ზუსტად არ დაემთხვა.','error');
    try{
      const {error}=await client.rpc('teacher_delete_student',{p_student_id:s.user_id});
      if(error)throw error;
      toast('🗑️ მოსწავლე წარმატებით წაიშალა.');
      await load();
    }catch(e){console.error(e);toast('მოსწავლის წაშლა ვერ მოხერხდა: '+(e.message||''),'error')}
  }

  const style=document.createElement('style');
  style.textContent=`
    .student-tools{display:grid;grid-template-columns:1.5fr 1fr 1.1fr auto;gap:10px;margin:0 0 12px;padding:14px;border-radius:16px;background:#061a32;border:1px solid #00eaff33}
    .student-tools-info{font-size:13px;color:#9dc7d5;margin:0 0 15px}
    .student-manage-card{grid-template-columns:1.3fr .9fr 1.35fr!important}
    .student-manage-actions{display:flex;gap:7px;flex-wrap:wrap}
    .student-manage-actions .btn{padding:9px 11px;font-size:12px}
    @media(max-width:900px){.student-tools{grid-template-columns:1fr 1fr}.student-manage-card{grid-template-columns:1fr!important}.student-manage-actions{width:100%}.student-manage-actions .btn{flex:1}}
    @media(max-width:600px){.student-tools{grid-template-columns:1fr}.student-manage-actions{display:grid;grid-template-columns:1fr 1fr}.student-manage-actions .delete-btn{grid-column:1/-1}}
  `;
  document.head.appendChild(style);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
