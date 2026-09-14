/* Cross-Grade Master QA compatibility bridge */
(function(){
  'use strict';
  function mark(){
    var body=document.body;
    if(!body || body.getAttribute('data-topic-qa')) return;
    var grade=body.getAttribute('data-grade') || '';
    if(grade) body.setAttribute('data-topic-qa','grade-'+grade+'-mission-1');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mark,{once:false});
  else mark();
  new MutationObserver(mark).observe(document.documentElement,{childList:true,subtree:true});
})();
