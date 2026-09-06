/* English with Mariami — shared AI Magic Companion. Visual-only enhancement. */
(function(){
  'use strict';
  if(window.__AI_MAGIC_COMPANION__)return;
  window.__AI_MAGIC_COMPANION__=true;
  function loadCss(key,href){
    if(document.querySelector('link[data-ewm-'+key+']'))return;
    var l=document.createElement('link');
    l.rel='stylesheet'; l.href=href; l.setAttribute('data-ewm-'+key,'true');
    document.head.appendChild(l);
  }
  function loadJs(key,src){
    if(document.querySelector('script[data-ewm-'+key+']'))return;
    var s=document.createElement('script');
    s.src=src; s.defer=true; s.setAttribute('data-ewm-'+key,'true');
    document.head.appendChild(s);
  }
  var assets=[
    ['ai-magic-world-dimension-gate33','/shared/ai-magic-world-dimension-gate-33.css?v=20260906-dgate33','css'],
    ['ai-magic-world-quantum-navigator34','/shared/ai-magic-world-quantum-navigator-34.css?v=20260906-qnav34','css'],
    ['ai-magic-world-mission-hologram35','/shared/ai-magic-world-mission-hologram-35.css?v=20260906-mholo35','css'],
    ['ai-magic-world-neural-battlefield36','/shared/ai-magic-world-neural-battlefield-36.css?v=20260906-battle36','css'],
    ['ai-magic-world-neural-battle-arena37','/shared/ai-magic-world-neural-battle-arena-37.css?v=20260906-arena37','css'],
    ['ai-magic-world-neural-war-room38','/shared/ai-magic-world-neural-war-room-38.css?v=20260906-warroom38','css'],
    ['ai-magic-world-holographic-battle-command39','/shared/ai-magic-world-holographic-battle-command-39.css?v=20260906-hbc39','css'],
    ['ai-magic-world-omniverse-command-core40','/shared/ai-magic-world-omniverse-command-core-40.css?v=20260906-omni40','css'],
    ['ai-magic-world-dimension-gate33','/shared/ai-magic-world-dimension-gate-33.js?v=20260906-dgate33','js'],
    ['ai-magic-world-quantum-navigator34','/shared/ai-magic-world-quantum-navigator-34.js?v=20260906-qnav34','js'],
    ['ai-magic-world-mission-hologram35','/shared/ai-magic-world-mission-hologram-35.js?v=20260906-mholo35','js'],
    ['ai-magic-world-neural-battlefield36','/shared/ai-magic-world-neural-battlefield-36.js?v=20260906-battle36','js'],
    ['ai-magic-world-neural-battle-arena37','/shared/ai-magic-world-neural-battle-arena-37.js?v=20260906-arena37','js'],
    ['ai-magic-world-neural-war-room38','/shared/ai-magic-world-neural-war-room-38.js?v=20260906-warroom38','js'],
    ['ai-magic-world-holographic-battle-command39','/shared/ai-magic-world-holographic-battle-command-39.js?v=20260906-hbc39','js'],
    ['ai-magic-world-omniverse-command-core40','/shared/ai-magic-world-omniverse-command-core-40.js?v=20260906-omni40','js']
  ];
  assets.forEach(function(a){a[2]==='css'?loadCss(a[0],a[1]):loadJs(a[0],a[1]);});
})();
