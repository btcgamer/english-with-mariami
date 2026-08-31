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
   STUDENT GRADE SYNC
========================================================= */
(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase();
  const match=path.match(/(?:^|\/)grade([234])\.html$/);
  if(!match) return;
  const currentGrade=Number(match[1]);
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client) return;
  async function syncStudentGrade(){
    try{
      const {data:{user},error:userError}=await client.auth.getUser();
      if(userError||!user)return;
      const {data:profile,error:profileError}=await client.from('profiles').select('role,grade').eq('user_id',user.id).maybeSingle();
      if(profileError||!profile)return;
      const role=String(profile.role||'').trim().toLowerCase();
      if(role!=='student')return;
      const grade=Number(profile.grade||0);
      if(![2,3,4].includes(grade)||grade===currentGrade)return;
      location.replace('grade'+grade+'.html');
    }catch(error){console.warn('Student grade sync error:',error);}
  }
  syncStudentGrade();
})();

/* Shared durable progress sync */
(function(){
  const src='progress-sync.js';
  if(document.querySelector('script[data-english-mariami-progress-sync]'))return;
  const s=document.createElement('script');s.src=src;s.async=true;s.dataset.englishMariamiProgressSync='1';document.head.appendChild(s);
})();

/* Teacher + Student Grade 2/3/4 dashboard panels */
(function(){
  const src='dashboard-progress.js';
  if(document.querySelector('script[data-english-mariami-dashboard-progress]'))return;
  const s=document.createElement('script');s.src=src;s.async=true;s.dataset.englishMariamiDashboardProgress='1';document.head.appendChild(s);
})();
