/* English with Mariami — shared grade route guard.
   Authenticated teachers/parents may open any grade.
   Students may open only their assigned grade and are redirected safely.
*/
(function(){
  'use strict';
  var path=(location.pathname||'').toLowerCase();
  var match=path.match(/\/grade([234])(?:\/|\.html|$)/);
  if(!match)return;
  var requested=Number(match[1]);
  var db=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||window.supabase;
  if(!db||!db.auth||!db.from)return;
  var redirect='../login.html?redirect='+encodeURIComponent(location.pathname+location.search+location.hash);
  var busy=false;
  async function check(){
    if(busy)return;
    busy=true;
    try{
      var auth=await db.auth.getUser();
      var user=auth&&auth.data&&auth.data.user;
      if(!user){location.replace(redirect);return;}
      var profile=await db.from('profiles').select('user_id,role,grade').eq('user_id',user.id).maybeSingle();
      if(profile.error||!profile.data)return;
      var role=String(profile.data.role||'').trim().toLowerCase();
      var grade=Number(profile.data.grade||0);
      if(role==='student'&&grade>=2&&grade<=4&&grade!==requested){
        location.replace('../grade'+grade+'/index.html');
        return;
      }
      if(role!=='student'&&role!=='teacher'&&role!=='parent'){
        location.replace(redirect);
      }
    }catch(e){console.warn('[Grade Route Guard]',e)}
    finally{busy=false}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)check()});
})();
