/* Only the private-content build uses this client. No public-file/offline fallback. */
(() => {
 'use strict';
 async function get(resource){
  const auth=window.EWM_AUTH;
  const checked=await auth?.waitForSession(8000);
  if(!checked?.session?.access_token)throw new Error('მასალებისთვის ჯერ შედი ანგარიშში.');
  const response=await fetch(window.SUPABASE_URL+'/functions/v1/paid-course',{
   method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',apikey:window.SUPABASE_PUBLISHABLE_KEY||window.SUPABASE_KEY,Authorization:'Bearer '+checked.session.access_token},body:JSON.stringify({resource})
  });
  if(response.status===401)throw new Error('სესია დასრულდა. ხელახლა შედი ანგარიშში.');
  if(response.status===403)throw new Error('მასალებისთვის მოქმედი გამოწერაა საჭირო. გახსენი „გამოწერა“.');
  if(!response.ok)throw new Error('დაცული მასალების სერვისი მიუწვდომელია. სცადე მოგვიანებით.');
  const result=await response.json();
  if(result.resource!==resource||!result.content||typeof result.content!=='object')throw new Error('მასალების პასუხი ვერ დადასტურდა.');
  return result.content;
 }
 window.EWM_PRIVATE_COURSE=Object.freeze({get});
})();
