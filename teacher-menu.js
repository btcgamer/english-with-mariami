// Teacher-only entry point
(function(){
  'use strict';
  const TEACHER_ID='be4b1c4d-e5f2-4039-b35e-aec3c110a94a';
  const path=location.pathname.toLowerCase();
  if(path.endsWith('/login.html')||path.endsWith('/register.html')||path.endsWith('/reset-password.html')) return;
  function add(){
    if(document.getElementById('teacher-menu-link')) return;
    const client=window.supabaseClient;
    if(!client) return setTimeout(add,150);
    client.auth.getSession().then(async ({data:{session}})=>{
      if(!session||session.user.id!==TEACHER_ID) return;
      const {data:p}=await client.from('profiles').select('role').eq('user_id',session.user.id).maybeSingle();
      if(!p||p.role!=='teacher') return;
      const link=document.createElement('a');link.id='teacher-menu-link';link.href='teacher-journal.html';link.textContent='👩‍🏫 ჟურნალი';
      link.style.cssText='background:linear-gradient(135deg,#ffe600,#ffb300)!important;color:#08101f!important;font-weight:1000!important;box-shadow:0 0 18px #ffe60044;';
      const nav=document.querySelector('.navlinks');
      if(nav) nav.prepend(link); else document.body.appendChild(link);
    }).catch(()=>{});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add();
})();
