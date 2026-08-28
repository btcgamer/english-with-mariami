// English with Mariami — grade-based student routing and access
(function(){
  'use strict';

  const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
  if(!client) return;

  const path = location.pathname.toLowerCase();
  const publicPages = ['/login.html','/register.html','/reset-password.html','/teacher-login.html'];
  if(publicPages.some(p => path.endsWith(p))) return;

  const gradeForPath = (p) => {
    if(p.endsWith('/grade2.html')) return 2;
    if(p.endsWith('/grade3.html')) return 3;
    if(p.endsWith('/grade4.html')) return 4;
    return null;
  };

  const gradePage = (grade) => `grade${grade}.html`;

  async function getAccess(){
    const {data: sessionData, error: sessionError} = await client.auth.getSession();
    if(sessionError || !sessionData?.session) return {session:null, profile:null};
    const user = sessionData.session.user;
    const {data: profile} = await client
      .from('profiles')
      .select('user_id,grade,role,full_name')
      .eq('user_id', user.id)
      .maybeSingle();
    return {session:sessionData.session, profile};
  }

  async function guardPage(){
    const {session, profile} = await getAccess();
    if(!session){
      const target = location.pathname + location.search + location.hash;
      location.replace('login.html?redirect=' + encodeURIComponent(target));
      return;
    }

    const role = String(profile?.role || '').toLowerCase();
    if(role === 'teacher' || role === 'admin') return;

    const grade = Number(profile?.grade);
    if(![2,3,4].includes(grade)){
      location.replace('login.html');
      return;
    }

    const currentGrade = gradeForPath(path);
    const isOpenPage = path.endsWith('/index.html') || path.endsWith('/academy.html') || path === '/' || path.endsWith('/english-with-mariami/');

    // Students always land in their own grade.
    if(isOpenPage || (currentGrade !== null && currentGrade !== grade)){
      const target = gradePage(grade);
      if(!path.endsWith('/' + target)) location.replace(target);
    }
  }

  // Login page: intercept before the old login handler and route by the registered grade.
  if(path.endsWith('/login.html')){
    document.addEventListener('submit', async function(e){
      if(!e.target || e.target.id !== 'loginForm') return;
      e.preventDefault();
      e.stopImmediatePropagation();

      const form = e.target;
      const email = document.getElementById('email');
      const password = document.getElementById('password');
      const button = document.getElementById('loginButton');
      const message = document.getElementById('message');
      if(!email || !password || !button || !message) return;

      const em = email.value.trim().toLowerCase();
      const pw = password.value;
      if(!em || !pw) return;

      button.disabled = true;
      button.textContent = '⏳ შესვლა...';
      message.className = 'message';
      message.textContent = '';

      try{
        const {data, error} = await client.auth.signInWithPassword({email:em,password:pw});
        if(error) throw error;
        if(!data?.session) throw new Error('სესია ვერ შეიქმნა.');

        const user = data.user;
        let role = '';
        let grade = 0;
        try{
          const r = await client.from('profiles').select('grade,role').eq('user_id',user.id).maybeSingle();
          if(r.error) throw r.error;
          role = String(r.data?.role || '').toLowerCase();
          grade = Number(r.data?.grade || 0);
        }catch(profileError){
          console.error('Profile/grade lookup error:', profileError);
        }

        if(em === 'razmadzemariam45@gmail.com' || user.id === 'be4b1c4d-e5f2-4039-b35e-aec3c110a94a' || role === 'teacher' || role === 'admin'){
          message.className = 'message success';
          message.textContent = '👩‍🏫 შესვლა წარმატებულია!';
          setTimeout(() => location.replace('teacher-dashboard.html'), 300);
          return;
        }

        if(![2,3,4].includes(grade)) throw new Error('თქვენს ანგარიშზე კლასი ვერ მოიძებნა. გთხოვთ, დაუკავშირდით მასწავლებელს.');

        message.className = 'message success';
        message.textContent = `✅ შესვლა წარმატებულია! იხსნება მე-${grade} კლასის სივრცე...`;
        setTimeout(() => location.replace(gradePage(grade)), 350);
      }catch(err){
        console.error('Grade login error:', err);
        message.className = 'message error';
        message.textContent = /invalid login credentials/i.test(err.message)
          ? '❌ ელფოსტა ან პაროლი არასწორია.'
          : '❌ ' + (err.message || 'შესვლა ვერ მოხერხდა.');
        button.disabled = false;
        button.textContent = '🚀 შესვლა';
      }
    }, true);
    return;
  }

  guardPage();
})();
