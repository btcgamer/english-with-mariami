/* English with Mariami — Academy grade cards are visual-only. */
(function(){
  'use strict';
  if(!/\/academy\.html(?:$|[?#])/i.test(location.pathname+location.search+location.hash)) return;

  function markVisualOnly(){
    document.querySelectorAll('.grade-link').forEach(function(link){
      link.setAttribute('aria-disabled','true');
      link.setAttribute('role','button');
      link.setAttribute('tabindex','0');
      link.title='კლასი — მხოლოდ ვიზუალური ბლოკი';
    });
  }

  /* Capture before the existing grade-navigation handlers so no grade page
     can be opened from Academy and no grade-entry/auth flow is triggered. */
  document.addEventListener('click',function(event){
    const link=event.target.closest&&event.target.closest('.grade-link');
    if(!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    markVisualOnly();
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ') return;
    const link=event.target.closest&&event.target.closest('.grade-link');
    if(!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',markVisualOnly,{once:true});
  }else{
    markVisualOnly();
  }
})();
