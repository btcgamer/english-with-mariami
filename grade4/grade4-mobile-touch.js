/* Grade 4 mobile touch hardening. Keep desktop card tilt; avoid hover-style transforms on touch. */
(function(){'use strict';
  var mobile=window.matchMedia&&window.matchMedia('(pointer:coarse),(max-width:700px)').matches;
  if(!mobile)return;
  function reset(){
    var root=document.querySelector('#missions');
    if(!root)return;
    root.querySelectorAll('.mission').forEach(function(card){card.style.transform='';});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reset,{once:true});
  else reset();
})();
