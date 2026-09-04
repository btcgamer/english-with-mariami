/* Grade 4: keep touch interaction light without a global document listener. */
(function(){'use strict';
  var coarse=window.matchMedia&&window.matchMedia('(pointer:coarse),(max-width:700px)').matches;
  if(!coarse)return;
  function init(){
    var root=document.querySelector('#missions');
    if(!root)return;
    root.addEventListener('pointermove',function(e){
      var card=e.target&&e.target.closest?e.target.closest('.mission'):null;
      if(card)e.stopPropagation();
    },true);
    root.querySelectorAll('.mission').forEach(function(card){card.style.transform=''});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
