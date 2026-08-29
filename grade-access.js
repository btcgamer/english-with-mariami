/* English with Mariami — grade access */
(function(){
  'use strict';

  const ALLOWED_GRADES = [2,3,4];
  const path = (location.pathname || '').toLowerCase();
  const match = path.match(/(?:^|\/)grade([234])\.html$/);
  const currentGrade = match ? Number(match[1]) : 0;

  if (!currentGrade) return;

  const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;

  function go(url){ location.replace(url); }

  async function check(){
    if (!client) {
      console.error('Grade access: Supabase client is not ready.');
      return;
    }

    try {
      const { data: userData, error: userError } = await client.auth.getUser();

      if (userError || !userData || !userData.user) {
        go('login.html?redirect=' + encodeURIComponent(location.pathname + location.search + location.hash));
        return;
      }

      const user = userData.user;

      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('role,grade')
        .eq('user_id', user.id)
        .maybeSingle();

      /* SECURITY: if we cannot verify the profile, do not grant grade access. */
      if (profileError || !profile) {
        console.error('Grade access profile error:', profileError);
        go('login.html');
        return;
      }

      const role = String(profile.role || '').trim().toLowerCase();
      const grade = Number(profile.grade || 0);

      /* Parent: Grade 2, 3 and 4. */
      if (role === 'parent' && ALLOWED_GRADES.includes(currentGrade)) return;

      /* Teacher: Grade 2, 3 and 4. */
      if (role === 'teacher' && ALLOWED_GRADES.includes(currentGrade)) return;

      /* Student: ONLY the grade saved in profiles. */
      if (role === 'student') {
        if (!ALLOWED_GRADES.includes(grade)) {
          go('login.html');
          return;
        }

        if (grade === currentGrade) return;

        go('grade' + grade + '.html');
        return;
      }

      /* Unknown/missing role: no grade access. */
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
