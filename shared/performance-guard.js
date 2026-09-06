/* English with Mariami — lightweight runtime performance guard v2 */
(function(){'use strict';
if(window.__EWM_PERFORMANCE_GUARD__)return;
window.__EWM_PERFORMANCE_GUARD__=true;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const lowPower=reduce||navigator.hardwareConcurrency<=4||innerWidth<700||coarse;
let hidden=document.hidden;
const apply=()=>{
 hidden=document.hidden;
 document.documentElement.classList.toggle('ewm-low-power',lowPower);
 document.documentElement.classList.toggle('ewm-tab-hidden',hidden);
};
apply();
addEventListener('resize',apply,{passive:true});
addEventListener('visibilitychange',apply,{passive:true});
/* V2: keep expensive decorative animation and touch tilt off on constrained devices. */
if(lowPower){
 const style=document.createElement('style');
 style.dataset.ewmPerformanceGuard='1';
 style.textContent='.ewm-low-power *{scroll-behavior:auto!important}.ewm-low-power .od-letter,.ewm-low-power .od-rune,.ewm-low-power .od-robot,.ewm-low-power .mwp-orb,.ewm-low-power .magic-world-portals:before{animation:none!important}.ewm-tab-hidden .od-letter,.ewm-tab-hidden .od-rune,.ewm-tab-hidden .od-robot,.ewm-tab-hidden .mwp-orb,.ewm-tab-hidden .magic-world-portals:before{animation-play-state:paused!important}.ewm-low-power .u-holo{transform:none!important}';
 (document.head||document.documentElement).appendChild(style);
}
/* Keep action-burst DOM bounded without polling when possible. */
const cap=()=>{
 const bursts=document.querySelectorAll('.od-action-burst');
 for(let i=0;i<Math.max(0,bursts.length-8);i++)bursts[i].remove();
};
addEventListener('pointerdown',cap,{passive:true});
let lastCap=0;
const onFrame=now=>{
 if(now-lastCap>5000){lastCap=now;cap();}
 requestAnimationFrame(onFrame);
};
requestAnimationFrame(onFrame);
})();
