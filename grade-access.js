/* English with Mariami — strict grade access */
(function(){
  'use strict';

  const FULL_ACCESS_EMAIL = 'datogringo@gmail.com';
  const TEACHER_EMAIL = 'razmadzemariam45@gmail.com';
  const TEACHER_ID = 'be4b1c4d-e5f2-4039-b35e-aec3c110a94a';
  const ALLOWED_GRADES = [2,3,4];
  const path = (location.pathname || '').toLowerCase();
  const match = path.match(/(?:^|\/)grade([234])\.html$/);
  const currentGrade = match ? Number(match[1]) : 0;

  if (!currentGrade) return;

  /* Hide the grade page until access is verified. This prevents a flash of
     another class while the Supabase profile is being checked. */
  document.documentElement.style.visibility = 'hidden';

  const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;

  function go(url){
    location.replace(url);
  }

  function allow(){
    document.documentElement.style.visibility = 'visible';
  }

  async function check(){
    if (!client) {
      go('login.html');
      return;
    }

    try {
      const sessionResult = await client.auth.getSession();
      const user = sessionResult?.data?.session?.user;

      if (!user) {
        go('login.html?redirect=' + encodeURIComponent(location.pathname));
        return;
      }

      const email = String(user.email || '').trim().toLowerCase();

      /* Only this account has unrestricted access. */
      if (email === FULL_ACCESS_EMAIL) {
        allow();
        return;
      }

      /* Teacher account must use the teacher dashboard, not student pages. */
      if (email === TEACHER_EMAIL || user.id === TEACHER_ID) {
        go('teacher-dashboard.html');
        return;
      }

      const profileResult = await client
        .from('profiles')
        .select('role,grade')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileResult.error) {
        console.error('Grade access profile error:', profileResult.error);
        go('login.html');
        return;
      }

      const profile = profileResult.data;
      const role = String(profile?.role || '').trim().toLowerCase();
      const grade = Number(profile?.grade || 0);

      /* Parent: all three student grades. */
      if (role === 'parent' && ALLOWED_GRADES.includes(currentGrade)) {
        allow();
        return;
      }

      /* Student: exactly their registered grade. */
      if (role === 'student' && ALLOWED_GRADES.includes(grade)) {
        if (grade === currentGrade) {
          allow();
          return;
        }
        go('grade' + grade + '.html');
        return;
      }

      /* A teacher profile is never treated as a student. */
      if (role === 'teacher') {
        go('teacher-dashboard.html');
        return;
      }

      go('login.html');
    } catch (error) {
      console.error('Grade access error:', error);
      go('login.html');
    }
  }

  window.ENGLISH_MARIAMI_GRADE_ACCESS = {
    check: check,
    getCurrentGrade: function(){ return currentGrade; }
  };

  check();
})();
