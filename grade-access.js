/* English with Mariami — grade access
   Student grade is ALWAYS read from Supabase profiles.grade.
   Automatically redirects students when teacher changes their grade.
*/
(function(){
  'use strict';

  const ALLOWED_GRADES = [2, 3, 4];

  const path = (location.pathname || '').toLowerCase();
  const match = path.match(/(?:^|\/)grade([234])\.html$/);
  const currentGrade = match ? Number(match[1]) : 0;

  /* This file only controls Grade 2/3/4 pages. */
  if (!currentGrade) return;

  function getClient(){
    return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
           window.supabaseClient ||
           window.supabase;
  }

  function goToGrade(grade){
    grade = Number(grade);

    if (!ALLOWED_GRADES.includes(grade)) {
      location.replace('login.html');
      return;
    }

    const target = 'grade' + grade + '.html';

    /*
      Do not redirect if we are already on the correct page.
    */
    if (currentGrade === grade) return;

    console.log(
      '[Grade Access] Redirecting:',
      'Grade ' + currentGrade,
      '→',
      'Grade ' + grade
    );

    location.replace(target);
  }

  function goLogin(){
    location.replace(
      'login.html?redirect=' +
      encodeURIComponent(
        location.pathname +
        location.search +
        location.hash
      )
    );
  }

  async function check(){

    let client = getClient();

    /*
      Supabase may load slightly later than this script.
      Wait for it instead of giving up.
    */
    if (!client) {
      console.log('[Grade Access] Waiting for Supabase...');

      let attempts = 0;

      const wait = setInterval(async function(){

        attempts++;
        client = getClient();

        if (client) {
          clearInterval(wait);

          try {
            await checkWithClient(client);
          } catch(error) {
            console.error('[Grade Access]', error);
          }
        }

        /*
          Stop after about 15 seconds.
        */
        if (attempts >= 30) {
          clearInterval(wait);
          console.error(
            '[Grade Access] Supabase client was not found.'
          );
        }

      }, 500);

      return;
    }

    await checkWithClient(client);
  }

  async function checkWithClient(client){

    try {

      const {
        data: userData,
        error: userError
      } = await client.auth.getUser();

      if (userError || !userData || !userData.user) {
        console.warn('[Grade Access] User is not logged in.');
        goLogin();
        return;
      }

      const user = userData.user;

      /*
        IMPORTANT:
        We read the CURRENT grade directly from Supabase.
        We do NOT use localStorage.
      */
      const {
        data: profile,
        error: profileError
      } = await client
        .from('profiles')
        .select('user_id,role,grade')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          '[Grade Access] Profile error:',
          profileError
        );
        return;
      }

      if (!profile) {
        console.error(
          '[Grade Access] Profile not found.'
        );
        goLogin();
        return;
      }

      const role = String(
        profile.role || ''
      ).trim().toLowerCase();

      const grade = Number(profile.grade || 0);

      console.log(
        '[Grade Access]',
        'role =', role,
        '| Supabase grade =', grade,
        '| current page =', currentGrade
      );

      /*
        ============================
        STUDENT
        ============================
      */
      if (role === 'student') {

        /*
          Student must have Grade 2, 3 or 4.
        */
        if (!ALLOWED_GRADES.includes(grade)) {
          console.warn(
            '[Grade Access] Student has invalid grade:',
            grade
          );

          goLogin();
          return;
        }

        /*
          THIS IS THE IMPORTANT PART.

          If teacher changes:
          2 → 3
          2 → 4
          3 → 2
          3 → 4
          4 → 2
          4 → 3

          the student is automatically redirected.
        */
        if (grade !== currentGrade) {
          goToGrade(grade);
          return;
        }

        /*
          Correct grade.
        */
        return;
      }

      /*
        ============================
        TEACHER
        ============================
        Teachers can access all grades.
      */
      if (role === 'teacher') {
        return;
      }

      /*
        ============================
        PARENT
        ============================
        Parents can access all grades.
      */
      if (role === 'parent') {
        return;
      }

      /*
        Unknown role.
      */
      console.warn(
        '[Grade Access] Unknown role:',
        role
      );

      goLogin();

    } catch(error) {

      console.error(
        '[Grade Access] Unexpected error:',
        error
      );

    }
  }

  /*
    Public API.
  */
  window.ENGLISH_MARIAMI_GRADE_ACCESS = {
    check: check,
    getCurrentGrade: function(){
      return currentGrade;
    }
  };

  /*
    Initial check.
  */
  check();

  /*
    Re-check when the student returns to the page.
  */
  document.addEventListener(
    'visibilitychange',
    function(){
      if (!document.hidden) {
        check();
      }
    }
  );

  /*
    Re-check when browser window gets focus.
  */
  window.addEventListener(
    'focus',
    function(){
      check();
    }
  );

  /*
    Extra protection:
    Check every 10 seconds while the page is open.

    This means if the teacher changes:
    Grade 2 → Grade 3

    while the student is already sitting on Grade 2,
    the page will notice the change and move them.
  */
  setInterval(function(){
    check();
  }, 10000);

})();
