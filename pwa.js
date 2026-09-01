/* English with Mariami — safe PWA bootstrap */
(function(){
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js', {scope:'/'}).then(function(reg){
      if (reg.update) reg.update();
    }).catch(function(err){
      console.warn('[PWA] Service Worker unavailable:', err);
    });
  }, {once:true});
})();
