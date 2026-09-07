/* English with Mariami — Academy grade access gate. */
(function(){
  'use strict';
  if(!/\/academy\.html(?:$|[?#])/i.test(location.pathname+location.search+location.hash)) return;

  const VALID_GRADES=[2,3,4];
  const PRIVILEGED_ROLES=['teacher','admin','parent'];
  let busy=false;

  function getClient(){return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null}
  function loginUrl(){const current=location.pathname+location.search+location.hash;return 'login.html?redirect='+encodeURIComponent(current)}
  function links(){return document.querySelectorAll('.grade-link[data-grade]')}
  function setMessage(text){const el=document.getElementById('grade-message');if(el)el.textContent=text}
  function hideLoader(){document.body.classList.remove('is-loading');const el=document.getElementById('academyLoader');if(el)el.classList.add('hidden')}

  async function waitForClient(){
    let client=getClient();
    if(client)return client;
    await new Promise(function(resolve){
      let done=false;
      function finish(){if(done)return;done=true;resolve()}
      window.addEventListener('englishMariamiSupabaseReady',finish,{once:true});
      setTimeout(finish,5000);
    });
    return getClient();
  }

  async function getAccess(){
    const client=await waitForClient();
    if(!client)return {client:null,user:null,profile:null};
    const sessionResult=await client.auth.getSession();
    const session=sessionResult.data&&sessionResult.data.session;
    const user=session&&session.user;
    if(sessionResult.error||!user)return {client,user:null,profile:null};
    const result=await client.from('profiles').select('role,grade,full_name').eq('user_id',user.id).maybeSingle();
    if(result.error)throw result.error;
    return {client,user,profile:result.data||{}};
  }

  async function initGate(){
    try{
      const access=await getAccess();
      if(!access.user){
        setMessage('კლასის გასახსნელად გაიარე ავტორიზაცია. ახალი მომხმარებელი ჯერ დარეგისტრირდი. 🔐');
        hideLoader();
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
      hideLoader();
    }catch(error){
      console.error('Academy gate init error:',error);
      setMessage('ანგარიშის შემოწმება დროებით ვერ მოხერხდა. სცადე თავიდან.');
      hideLoader();
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

  /* The old inline Academy initializer redirected every visitor immediately.
     Intercept only that initializer and replace it with the access-gate flow. */
  const nativeAdd=document.addEventListener.bind(document);
  document.addEventListener=function(type,listener,options){
    if(type==='DOMContentLoaded'&&typeof listener==='function'&&/initAcademy/.test(Function.prototype.toString.call(listener))){
      return nativeAdd(type,initGate,options);
    }
    return nativeAdd(type,listener,options);
  };

  if(document.readyState==='loading')nativeAdd('DOMContentLoaded',initGate,{once:true});
  else initGate();
})();
