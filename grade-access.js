/* English with Mariami — grade access */
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

  const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;

  function go(url){ location.replace(url); }

  async function check(){
    /* Never hide the existing Grade 2/3/4 page. Access control only redirects
       accounts that are not allowed to open the page. */
    if (!client) return;

    try {
      const result = await client.auth.getSession();
      const user = result?.data?.session?.user;

      if (!user) {
        go('login.html?redirect=' + encodeURIComponent(location.pathname));
        return;
      }

      const email = String(user.email || '').trim().toLowerCase();

      /* Owner: full access. */
      if (email === FULL_ACCESS_EMAIL) return;

      /* Mariami: teacher account keeps full access to the learning site. */
      if (email === TEACHER_EMAIL || user.id === TEACHER_ID) return;

      const profileResult = await client
        .from('profiles')
        .select('role,grade')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileResult.error) {
        console.error('Grade access profile error:', profileResult.error);
        return;
      }

      const profile = profileResult.data;
      const role = String(profile?.role || '').trim().toLowerCase();
      const grade = Number(profile?.grade || 0);

      /* Parent can see Grade 2, 3 and 4. */
      if (role === 'parent' && ALLOWED_GRADES.includes(currentGrade)) return;

      /* Student can see only the grade selected during registration. */
      if (role === 'student' && ALLOWED_GRADES.includes(grade)) {
        if (grade === currentGrade) return;
        go('grade' + grade + '.html');
        return;
      }

      /* Teacher role is allowed to view all grades. */
      if (role === 'teacher') return;

      go('login.html');
    } catch (error) {
      /* Do not blank an existing grade page because of an access-script error. */
      console.error('Grade access error:', error);
    }
  }

  window.ENGLISH_MARIAMI_GRADE_ACCESS = {
    check: check,
    getCurrentGrade: function(){ return currentGrade; }
  };

  check();
})();
