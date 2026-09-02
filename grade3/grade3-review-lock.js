/* Grade 3 — Final Review access guard */
(function(){
  'use strict';
  const root=window.GRADE3_FUTURISTIC_CONTENT||{};
  const worlds=Array.isArray(root.worlds)?root.worlds:[];
  const key='grade3UniverseProgress';
  function progress(){
    try{
      const state=JSON.parse(localStorage.getItem(key)||'{}');
      return Array.isArray(state.done)?state.done:[];
    }catch(_){return []}
  }
  function allowed(){
    return worlds.length<2||worlds.slice(0,-1).every((_,i)=>progress().includes(i));
  }
  function guard(e){
    if(!allowed()){
      e.preventDefault();
      e.stopImmediatePropagation();
      alert('🔒 Complete all previous missions before opening Final Review.');
      return false;
    }
    return true;
  }
  window.grade3FinalReviewAllowed=allowed;
  document.addEventListener('click',function(e){
    const button=e.target.closest('.g3-open');
    if(!button)return;
    const card=button.closest('.mission');
    if(!card)return;
    const i=Number(card.dataset.i);
    if(i===worlds.length-1)guard(e);
  },true);
})();
