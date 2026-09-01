/* English with Mariami — public Supabase browser configuration.
   This uses the publishable key, never a service_role/secret key. */

window.SUPABASE_URL = 'https://vtdhvsfqhwesxtwmduew.supabase.co';

window.SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

window.supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

window.__ENGLISH_MARIAMI_SUPABASE_CLIENT =
  window.supabaseClient;

/* =========================================================
   GRADE ACCESS GUARD
   1) authenticated user
   2) role must be Student
   3) requested grade must equal assigned profile.grade
   Database RLS remains the final server-side enforcement layer.
========================================================= */
(function(){
  'use strict';

  const path = (location.pathname || '').toLowerCase();
  const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
  if (!client) return;

  const gradeMatch = path.match(/(?:^|\/)grade([234])(?:\.html|\/index\.html)$/);
  const isStudentDashboard = path.endsWith('/student-dashboard.html') || path.endsWith('student-dashboard.html');

  function gradeTarget(grade){
    return Number(grade) === 2 ? '/grade2/index.html' : '/grade' + Number(grade) + '.html';
  }

  async function getProfile(){
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!user) return null;

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role,grade')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    return { user, profile };
  }

  function toastGradeAccess(message){
    let el = document.getElementById('__ewm_grade_guard_toast');
    if(!el){
      el = document.createElement('div');
      el.id = '__ewm_grade_guard_toast';
      el.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:999999;padding:12px 16px;border-radius:12px;background:#071a30;border:1px solid rgba(255,65,108,.5);color:#fff;font:900 13px Inter,system-ui,sans-serif;box-shadow:0 12px 35px rgba(0,0,0,.45)';
      document.body.appendChild(el);
    }
    el.textContent = message;
    clearTimeout(el.__timer);
    el.__timer = setTimeout(() => el.remove(), 2800);
  }

  async function guardGradePage(){
    if(!gradeMatch) return;

    try{
      const currentGrade = Number(gradeMatch[1]);
      const auth = await getProfile();

      if(!auth){
        location.replace('/login.html?reason=unauthorized');
        return;
      }

      const role = String(auth.profile?.role || '').trim().toLowerCase();
      const assignedGrade = Number(auth.profile?.grade || 0);

      if(role !== 'student'){
        location.replace(role === 'teacher' ? '/teacher-dashboard.html' : '/login.html?reason=wrong-role');
        return;
      }

      if(![2,3,4].includes(assignedGrade)){
        location.replace('/student-dashboard.html?reason=no-grade');
        return;
      }

      if(assignedGrade !== currentGrade){
        location.replace(gradeTarget(assignedGrade) + '?reason=grade-locked');
      }
    }catch(error){
      console.warn('Grade access guard error:', error);
      location.replace('/student-dashboard.html?reason=access-check');
    }
  }

  async function guardStudentDashboard(){
    if(!isStudentDashboard) return;

    try{
      const auth = await getProfile();
      if(!auth){
        location.replace('/login.html?reason=unauthorized');
        return;
      }

      const role = String(auth.profile?.role || '').trim().toLowerCase();
      if(role !== 'student'){
        location.replace(role === 'teacher' ? '/teacher-dashboard.html' : '/login.html?reason=wrong-role');
        return;
      }

      document.addEventListener('click', function(event){
        const button = event.target && event.target.closest
          ? event.target.closest('[data-open-grade]')
          : null;
        if(!button) return;

        const requested = Number(button.dataset.openGrade || 0);
        const assigned = Number(auth.profile?.grade || 0);

        if(![2,3,4].includes(assigned) || requested !== assigned){
          event.preventDefault();
          event.stopImmediatePropagation();
          toastGradeAccess('🔒 ეს Grade შენთვის არ არის მინიჭებული.');
        }
      }, true);
    }catch(error){
      console.warn('Student dashboard access guard error:', error);
    }
  }

  guardGradePage();
  guardStudentDashboard();
})();

/* Shared durable progress sync */
(function(){
  const src = 'progress-sync.js';
  if(document.querySelector('script[data-english-mariami-progress-sync]')) return;
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.dataset.englishMariamiProgressSync = '1';
  document.head.appendChild(s);
})();

/* Teacher + Student Grade 2/3/4 dashboard panels */
(function(){
  const src = 'dashboard-progress.js';
  if(document.querySelector('script[data-english-mariami-dashboard-progress]')) return;
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.dataset.englishMariamiDashboardProgress = '1';
  document.head.appendChild(s);
})();