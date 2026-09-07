/* English with Mariami — Academy grade access gate. */
(function(){
  'use strict';
  if(!/\/academy\.html(?:$|[?#])/i.test(location.pathname+location.search+location.hash)) return;

  const VALID_GRADES=[2,3,4];
  const PRIVILEGED_ROLES=['teacher','admin','parent'];
  let busy=false;

  function getClient(){
    return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null;
  }

  function loginUrl(){
    const current=window.location.pathname+window.location.search+window.location.hash;
    return 'login.html?redirect='+encodeURIComponent(current);
  }

  function getLinks(){
    return document.querySelectorAll('.grade-link[data-grade]');
  }

  async function waitForClient(){
    let client=getClient();
    if(client) return client;
    await new Promise(function(resolve){
      let done=false;
      function finish(){if(done)return;done=true;resolve();}
      window.addEventListener('englishMariamiSupabaseReady',finish,{once:true});
      setTimeout(finish,5000);
    });
    return getClient();
  }

  async function openGrade(link){
    if(busy) return;
    busy=true;
    const targetGrade=Number(link.dataset.grade);
    const client=await waitForClient();

    if(!client){
      window.location.href=loginUrl();
      return;
    }

    try{
      const sessionResult=await client.auth.getSession();
      const session=sessionResult.data&&sessionResult.data.session;
      const user=session&&session.user;

      if(sessionResult.error||!session||!user){
        window.location.href=loginUrl();
        return;
      }

      const profileResult=await client
        .from('profiles')
        .select('role,grade,full_name')
        .eq('user_id',user.id)
        .maybeSingle();

      if(profileResult.error){
        console.error('Academy grade access profile error:',profileResult.error);
        alert('ანგარიშის მონაცემების შემოწმება ვერ მოხერხდა. სცადე თავიდან.');
        return;
      }

      const profile=profileResult.data||{};
      const role=String(profile.role||user.user_metadata?.role||'student').trim().toLowerCase();
      const grade=Number(profile.grade||user.user_metadata?.grade||0);

      if(PRIVILEGED_ROLES.includes(role)){
        window.location.href=link.getAttribute('href');
        return;
      }

      if(role!=='student'){
        alert('ამ ანგარიშს სასწავლო კლასზე წვდომა არ აქვს.');
        return;
      }

      if(!VALID_GRADES.includes(grade)){
        alert('კლასი ჯერ არ არის მინიჭებული. დაელოდე მასწავლებელს, რომ კლასი მოგანიჭოს.');
        return;
      }

      if(grade!==targetGrade){
        alert('შენს ანგარიშზე მინიჭებულია მე-'+grade+' კლასი. სხვა კლასის გახსნა შეუძლებელია.');
        return;
      }

      window.location.href=link.getAttribute('href');
    }catch(error){
      console.error('Academy grade access error:',error);
      alert('ავტორიზაციის შემოწმება ვერ მოხერხდა. სცადე თავიდან.');
    }finally{
      busy=false;
    }
  }

  function prepareLinks(){
    getLinks().forEach(function(link){
      const grade=Number(link.dataset.grade);
      if(!VALID_GRADES.includes(grade)) return;
      link.title='კლასის გახსნა — საჭიროა ავტორიზაცია და მასწავლებლის მიერ კლასის მინიჭება';
    });
  }

  document.addEventListener('click',function(event){
    const link=event.target.closest&&event.target.closest('.grade-link[data-grade]');
    if(!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openGrade(link);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ') return;
    const link=event.target.closest&&event.target.closest('.grade-link[data-grade]');
    if(!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openGrade(link);
  },true);

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',prepareLinks,{once:true});
  }else{
    prepareLinks();
  }
})();
