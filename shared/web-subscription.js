/* Browser, desktop and installed PWA use the same verified web membership. */
(() => {
 'use strict';
 window.EWM_WEB_SUBSCRIPTION={init:async function(){
  const status=document.getElementById('subscription-status'),signIn=document.getElementById('subscription-sign-in');
  const buttons=[...document.querySelectorAll('[data-plan]')],refresh=document.getElementById('restore-purchases'),manage=document.getElementById('manage-web-subscription');
  const prices={monthly:'$2.50',quarterly:'$6.70','half-yearly':'$15.78',yearly:'$31.56'};
  let busy=false,ready=false,active=false,isAdmin=false,source=null,hasWebSubscription=false,purchaseBlocked=false;
  document.getElementById('manage-play-subscription').hidden=true;
  document.getElementById('subscription-renewal-terms').textContent='სრული თანხა ჩამოიჭრება არჩეული პერიოდისთვის. გამოწერა ავტომატურად განახლდება, სანამ არ გააუქმებ პირადი გადახდების კაბინეტიდან. გაუქმება აჩერებს მომავალ გადახდებს; წვდომა დარჩება დადასტურებული პერიოდის ბოლომდე. ბარათის მონაცემები შეიყვანება გადახდის პროვაიდერის დაცულ გვერდზე. საბოლოო ფასი და გადასახადები გამოჩნდება შეძენამდე. არასრულწლოვნისთვის შეძენა მშობელმა ან მეურვემ უნდა განახორციელოს.';
  refresh.textContent='წვდომის გადამოწმება';
  for(const [id,price] of Object.entries(prices))document.querySelector(`[data-price="${id}"]`).textContent=price;
  function controls(){buttons.forEach(b=>{b.disabled=busy||!ready||active||purchaseBlocked});refresh.disabled=busy;manage.disabled=busy;manage.hidden=!hasWebSubscription||isAdmin;document.getElementById('manage-play-subscription').hidden=!active||isAdmin||source!=='play';}
  function paymentURL(value,checkout=true){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&(url.hostname==='lemonsqueezy.com'||url.hostname.endsWith('.lemonsqueezy.com'))&&(!checkout||url.pathname.startsWith('/checkout/'));}catch{return false;}}
  async function api(action,plan){
   const session=await window.EWM_AUTH?.waitForSession(8000);
   if(!session?.session?.access_token){signIn.hidden=false;throw Error('გთხოვ, ჯერ შეხვიდე შენს ანგარიშში.');}
   signIn.hidden=true;
   const response=await fetch(window.SUPABASE_URL+'/functions/v1/web-subscription',{
    method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',apikey:window.SUPABASE_PUBLISHABLE_KEY||window.SUPABASE_KEY,Authorization:'Bearer '+session.session.access_token},body:JSON.stringify({action,...(plan?{plan}:{})})
   });
   if(!response.ok){
    if(response.status===401){signIn.hidden=false;throw Error('სესია დასრულდა. ხელახლა შედი ანგარიშში.');}
    if(response.status===409)throw Error('გამოწერა უკვე გაქვს. გადაამოწმე სტატუსი ან გახსენი გადახდების მართვა.');
    throw Error('ვებგადახდები ჯერ მიუწვდომელია. თანხა არ გადაიხადო, სანამ დაცული გადახდის ფორმა არ გაიხსნება.');
   }
   return response.json();
  }
  async function check(){
   const result=await api('status');
   if(result.ready!==true||typeof result.active!=='boolean')throw Error('წვდომა ვერ დადასტურდა.');
   active=result.active;source=result.source;isAdmin=result.access==='admin';ready=result.webReady===true;hasWebSubscription=result.hasWebSubscription===true;purchaseBlocked=result.webPurchaseBlocked===true;
   document.querySelector('.plans').hidden=isAdmin;
   status.textContent=isAdmin?'ადმინისტრატორის წვდომა დადასტურებულია. გამოწერის შეძენა არ გჭირდება.':active?'ყველა კლასზე წვდომა დადასტურებულია.':purchaseBlocked?'გამოწერა არსებობს, მაგრამ წვდომა ჯერ არ დასტურდება. გადახდების მართვის გვერდზე შეამოწმე ან გააუქმე ის.':ready?(new URLSearchParams(location.search).has('checkout')?'თუ გადახდა დაასრულე, დაელოდე სერვერის დადასტურებას და გადაამოწმე წვდომა.':'აირჩიე პერიოდი — ბარათით გადახდა გაიხსნება დაცულ გვერდზე.'):'ვებგადახდები ჯერ არ არის ჩართული. გეგმების საბაზო ფასები ნაჩვენებია ქვემოთ.';
  }
  async function update(){if(busy)return;busy=true;controls();try{await check()}catch(error){ready=false;active=false;status.textContent=error.message}finally{busy=false;controls()}}
  for(const button of buttons)button.addEventListener('click',async()=>{
   if(busy||!ready||active||purchaseBlocked)return;busy=true;controls();
   try{
    const result=await api('checkout',button.dataset.plan);
    if(!paymentURL(result.url))throw Error('გადახდის უსაფრთხო მისამართი ვერ დადასტურდა.');
    location.assign(result.url);
   }catch(error){status.textContent=error.message;busy=false;controls()}
  });
  manage.addEventListener('click',async()=>{
   if(busy)return;busy=true;controls();
   try{const result=await api('portal');if(!paymentURL(result.url,false))throw Error('კაბინეტის უსაფრთხო მისამართი ვერ დადასტურდა.');location.assign(result.url)}
   catch(error){status.textContent=error.message;busy=false;controls()}
  });
  refresh.addEventListener('click',update);
  window.addEventListener('focus',update);
  await update();
 }};
})();
