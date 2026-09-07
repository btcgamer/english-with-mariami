/* English with Mariami — public Supabase browser configuration. */
window.SUPABASE_URL='https://vtdhvsfqhwesxtwmduew.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY='sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

(function(){
  'use strict';
  const path=(window.location.pathname||'').toLowerCase();
  if(!path.endsWith('/academy.html') && path!=='academy.html') return;
  if(document.querySelector('script[data-ewm-academy-grade-layout]')) return;
  const s=document.createElement('script');
  s.src='/academy-grade-layout.js?v=20260907';
  s.defer=true;
  s.dataset.ewmAcademyGradeLayout='1';
  document.head.appendChild(s);
})();
