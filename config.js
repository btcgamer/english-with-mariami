/* English with Mariami — public Supabase browser configuration. */
window.SUPABASE_URL='https://vtdhvsfqhwesxtwmdue.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY='sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

(function(){
  'use strict';
  function initSupabaseClient(){if(window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient)return true;if(!window.supabase||typeof window.supabase.createClient!=='function')return false;try{const key=window.SUPABASE_PUBLISHABLE_KEY||window.SUPABASE_KEY;if(!window.SUPABASE_URL||!key)return false;window.__ENGLISH_MARIAMI_SUPABASE_CLIENT=window.supabase.createClient(window.SUPABASE_URL,key);window.dispatchEvent(new Event('englishMariamiSupabaseReady'));return true}catch(error){console.error('Supabase client initialization error:',error);return false}}
  if(!initSupabaseClient()){window.addEventListener('load',initSupabaseClient,{once:true});setTimeout(initSupabaseClient,0)}
  const path=location.pathname+location.search+location.hash,isAcademy=/\/academy\.html(?:$|[?#])/i.test(path),isTeacherDashboard=/\/teacher-dashboard\.html(?:$|[?#])/i.test(path);
  if(isTeacherDashboard&&!document.querySelector('script[data-ewm-teacher-dashboard-fix]')){const fix=document.createElement('script');fix.src='/shared/teacher-dashboard-fix.js?v=20260908';fix.async=false;fix.dataset.ewmTeacherDashboardFix='1';document.head.appendChild(fix)}
  if(!isAcademy)return;
  if(!document.querySelector('link[data-ewm-academy-visual]')){const css=document.createElement('link');css.rel='stylesheet';css.href='/academy-visual.css?v=20260908';css.dataset.ewmAcademyVisual='1';document.head.appendChild(css)}
  if(!document.querySelector('script[data-ewm-academy-command-center]')){const x=document.createElement('script');x.src='/academy-visual.js?v=20260915-cc3';x.defer=true;x.dataset.ewmAcademyCommandCenter='1';document.head.appendChild(x)}
  if(!document.querySelector('script[data-ewm-academy-portal-4]')){const x=document.createElement('script');x.src='/academy-portal-4.js?v=20260915-p4';x.defer=true;x.dataset.ewmAcademyPortal4='1';document.head.appendChild(x)}
  if(!document.querySelector('script[data-ewm-academy-gateway-5]')){const x=document.createElement('script');x.src='/academy-mission-gateway-5.js?v=20260915-g5';x.defer=true;x.dataset.ewmAcademyGateway5='1';document.head.appendChild(x)}
  if(!document.querySelector('script[data-ewm-academy-3d-reality-6]')){const x=document.createElement('script');x.src='/academy-3d-reality-6.js?v=20260915-3d6';x.defer=true;x.dataset.ewmAcademy3dReality6='1';document.head.appendChild(x)}
  if(!document.querySelector('script[data-ewm-academy-ai-guardian-7]')){const x=document.createElement('script');x.src='/academy-ai-guardian-7.js?v=20260915-g7';x.defer=true;x.dataset.ewmAcademyAiGuardian7='1';document.head.appendChild(x)}
  if(!document.querySelector('script[data-ewm-academy-world-8]')){const x=document.createElement('script');x.src='/academy-3d-world-environment-8.js?v=20260915-w8';x.defer=true;x.dataset.ewmAcademyWorld8='1';document.head.appendChild(x)}
  if(!document.querySelector('script[data-ewm-academy-world-portals-9]')){const x=document.createElement('script');x.src='/academy-3d-world-portals-9.js?v=20260915-w9';x.defer=true;x.dataset.ewmAcademyWorldPortals9='1';document.head.appendChild(x)}
  if(document.querySelector('script[data-ewm-academy-grade-visual-only]'))return;const visual=document.createElement('script');visual.src='/academy-grade-visual-only.js?v=20260908';visual.defer=true;visual.dataset.ewmAcademyGradeVisualOnly='1';document.head.appendChild(visual);
})();
