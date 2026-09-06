/* English with Mariami — lightweight runtime performance guard */
(function(){'use strict';
if(window.__EWM_PERFORMANCE_GUARD__)return;
window.__EWM_PERFORMANCE_GUARD__=true;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower=reduce||navigator.hardwareConcurrency<=4||innerWidth<700;
const apply=()=>{
 document.documentElement.classList.toggle('ewm-low-power',lowPower);
 if(document.hidden) document.documentElement.classList.add('ewm-tab-hidden');
 else document.documentElement.classList.remove('ewm-tab-hidden');
};
apply();
addEventListener('resize',apply,{passive:true});
addEventListener('visibilitychange',apply,{passive:true});
/* Stop repeated layout work from pointer effects on touch/low-power devices. */
if(lowPower){
 const style=document.createElement('style');
 style.dataset.ewmPerformanceGuard='1';
 style.textContent='.ewm-low-power *{scroll-behavior:auto!important}.ewm-low-power .od-letter,.ewm-low-power .od-rune,.ewm-low-power .od-robot,.ewm-low-power .mwp-orb,.ewm-low-power .magic-world-portals:before{animation:none!important}.ewm-tab-hidden .od-letter,.ewm-tab-hidden .od-rune,.ewm-tab-hidden .od-robot,.ewm-tab-hidden .mwp-orb,.ewm-tab-hidden .magic-world-portals:before{animation-play-state:paused!important}';
 (document.head||document.documentElement).appendChild(style);
}
/* Keep background visual effects from creating a growing DOM on long sessions. */
const cap=()=>{
 document.querySelectorAll('.od-action-burst').forEach((el,i)=>{if(i>7)el.remove()});
};
addEventListener('pointerdown',cap,{passive:true});
setInterval(cap,3000);
})();
