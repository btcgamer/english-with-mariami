/* Grade 4 mobile interaction hardening — no global listeners. */
(function(){'use strict';
  if(!window.matchMedia||!window.matchMedia('(pointer:coarse),(max-width:700px)').matches)return;
  document.addEventListener('DOMContentLoaded',function(){
    var root=document.querySelector('#missions');
    if(!root)return;
    var cards=root.querySelectorAll('.mission');
    cards.forEach(function(card){
      card.style.transform='';
    });
  },{once:true});
})();
