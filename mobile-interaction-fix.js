/* English with Mariami — mobile interaction safety layer */
(function(){
  'use strict';
  function init(){
    if(!window.matchMedia('(max-width: 900px)').matches)return;
    var path=(location.pathname||'').toLowerCase();
    var grade=path.indexOf('grade2')>-1?'2':path.indexOf('grade3')>-1?'3':path.indexOf('grade4')>-1?'4':null;
    if(!grade)return;
    /* The Grade 4 mission card already owns the click action. Keeping the visual
       OPEN WORLD control non-targetable prevents one tap from opening two modals. */
    if(grade==='4'){
      var style=document.createElement('style');
      style.textContent='.g4-open{pointer-events:none!important;}';
      document.head.appendChild(style);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
