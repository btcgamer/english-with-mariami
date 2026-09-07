/* English with Mariami — Academy grade cards are visual-only. */
(function(){
  'use strict';
  if(!/\/academy\.html(?:$|[?#])/i.test(location.pathname+location.search+location.hash)) return;

  function markVisualOnly(){
    document.querySelectorAll('.grade-link').forEach(function(link){
      /* Remove navigation itself, not just the click behavior. This keeps
         every Grade card visually intact while making it impossible for the
         browser to follow a stale href handler. */
      link.removeAttribute('href');
      link.setAttribute('aria-disabled','true');
      link.setAttribute('role','button');
      link.setAttribute('tabindex','0');
      link.title='კლასი — მხოლოდ ვიზუალური ბლოკი';
    });
  }

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
