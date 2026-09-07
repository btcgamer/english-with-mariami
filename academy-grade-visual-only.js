/* English with Mariami — Academy grade access gate. */
(function(){
  'use strict';
  if(!/\/academy\.html(?:$|[?#])/i.test(location.pathname+location.search+location.hash)) return;

  const VALID_GRADES=[2,3,4];
  const PRIVILEGED_ROLES=['teacher','admin','parent'];
  let busy=false;
  let initialized=false;

  function getClient(){return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null}
  function loginUrl(){const current=location.pathname+location.search+location.hash;return 'login.html?redirect='+encodeURIComponent(current)}
  function links(){return document.querySelectorAll('.grade-link[data-grade]')}
  function setMessage(text){const el=document.getElementById('grade-message');if(el)el.textContent=text}
  function hideLoader(){document.body.classList.remove('is-loading');const el=document.getElementById('academyLoader');if(el)el.classList.add('hidden')}

  /* Never let auth/network latency prevent the Academy UI from rendering. */
  setTimeout(hideLoader,1200);

  async function waitForClient(){
    const immediate=getClient();
    if(immediate)return immediate;
    await new Promise(function(resolve){
      let done=false;
      function finish(){if(done)return;done=true;resolve()}
      window.addEventListener('englishMariamiSupabaseReady',finish,{once:true});
      setTimeout(finish,2500);
    });
    return getClient();
  }

  async function getAccess(){
    const client=await waitForClient();
    if(!client)return {client:null,user:null,profile:null};
    try{
      const sessionResult=await client.auth.getSession();
      const session=sessionResult.data&&sessionResult.data.session;
      const user=session&&session.user;
      if(sessionResult.error||!user)return {client,user:null,profile:null};
      const result=await client.from('profiles').select('role,grade,full_name').eq('user_id',user.id).maybeSingle();
      if(result.error)throw result.error;
      return {client,user,profile:result.data||{}};
    }catch(error){
      console.error('Academy access lookup error:',error);
      return {client,user:null,profile:null,error:error};
    }
  }

  async function initGate(){
    if(initialized)return;
    initialized=true;
    /* UI first: the Academy must remain visible even if Supabase is unavailable. */
    hideLoader();
    try{
      const access=await getAccess();
      if(!access.user){
        setMessage('კლასის გასახსნელად გაიარე ავტორიზაცია. ახალი მომხმარებელი ჯერ დარეგისტრირდი. 🔐');
        return;
      }
      const profile=access.profile||{};
      const role=String(profile.role||access.user.user_metadata?.role||'student').trim().toLowerCase();
      const grade=Number(profile.grade||access.user.user_metadata?.grade||0);
      if(PRIVILEGED_ROLES.includes(role)){
        setMessage('მასწავლებლის/ადმინისტრატორის სრული რეჟიმი აქტიურია. 🎓');
      }else if(role==='student'&&VALID_GRADES.includes(grade)){
        links().forEach(function(link){if(Number(link.dataset.grade)!==grade){link.style.opacity='.45';link.title='ეს კლასი შენთვის არ არის მინიჭებული'}});
        setMessage('შენი მინიჭებული კლასი: მე-'+grade+' კლასი 🎓');
      }else{
        setMessage('კლასი ჯერ არ არის მინიჭებული. დაელოდე მასწავლებელს. 👩‍🏫');
      }
    }catch(error){
      console.error('Academy gate init error:',error);
      setMessage('ანგარიშის შემოწმება დროებით ვერ მოხერხდა. კლასის გახსნისას ხელახლა შემოწმდება.');
    }
  }

  async function openGrade(link){
    if(busy)return;
    busy=true;
    try{
      const target=Number(link.dataset.grade);
      const access=await getAccess();
      if(!access.user){location.href=loginUrl();return}
      const profile=access.profile||{};
      const role=String(profile.role||access.user.user_metadata?.role||'student').trim().toLowerCase();
      const grade=Number(profile.grade||access.user.user_metadata?.grade||0);
      if(PRIVILEGED_ROLES.includes(role)){location.href=link.getAttribute('href');return}
      if(role!=='student'){
        alert('ამ ანგარიშს სასწავლო კლასზე წვდომა არ აქვს.');
        return;
      }
      if(!VALID_GRADES.includes(grade)){
        alert('კლასი ჯერ არ არის მინიჭებული. დაელოდე მასწავლებელს, რომ კლასი მოგანიჭოს.');
        return;
      }
      if(grade!==target){
        alert('შენს ანგარიშზე მინიჭებულია მე-'+grade+' კლასი. სხვა კლასის გახსნა შეუძლებელია.');
        return;
      }
      location.href=link.getAttribute('href');
    }catch(error){
      console.error('Academy grade access error:',error);
      alert('ავტორიზაციის შემოწმება ვერ მოხერხდა. სცადე თავიდან.');
    }finally{busy=false}
  }

  links().forEach(function(link){link.title='კლასის გახსნა — საჭიროა ავტორიზაცია და მასწავლებლის მიერ კლასის მინიჭება'});

  document.addEventListener('click',function(event){
    const link=event.target.closest&&event.target.closest('.grade-link[data-grade]');
    if(!link)return;
    event.preventDefault();event.stopImmediatePropagation();openGrade(link);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const link=event.target.closest&&event.target.closest('.grade-link[data-grade]');
    if(!link)return;
    event.preventDefault();event.stopImmediatePropagation();openGrade(link);
  },true);

  /* The legacy Academy initializer redirects guests during DOMContentLoaded.
     Stop that legacy handler; this file owns grade access now. */
  const nativeAddEventListener=document.addEventListener.bind(document);
  document.addEventListener=function(type,listener,options){
    if(type==='DOMContentLoaded'&&typeof listener==='function'&&/initAcademy/.test(Function.prototype.toString.call(listener))){
      return nativeAddEventListener(type,initGate,options);
    }
    return nativeAddEventListener(type,listener,options);
  };

  document.addEventListener('DOMContentLoaded',function(event){
    event.stopImmediatePropagation();
    initGate();
  },true);

  if(document.readyState!=='loading')initGate();
})();
