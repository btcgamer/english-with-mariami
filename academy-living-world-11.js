(()=>{ 'use strict'; if(window.__ewmLiving11)return; window.__ewmLiving11=1;
const g=document.querySelector('[data-grade]')?.dataset.grade||'';const p=g==='4'?['#ffd76a','#a65cff']:g==='3'?['#64f7ff','#a86cff']:['#5beaff','#667dff'];
const st=document.createElement('style');st.textContent=`
body.ewm-live11 .w8-planet{filter:brightness(1.45) drop-shadow(0 0 35px ${p[0]});animation-duration:5s}body.ewm-live11 .w8-crystal{filter:brightness(1.8) drop-shadow(0 0 22px ${p[0]});animation-duration:3.5s}body.ewm-live11 .w9-gate{filter:brightness(1.7) drop-shadow(0 0 55px ${p[0])} !important}body.ewm-live11 .g7-core{filter:brightness(1.8);box-shadow:0 0 40px ${p[0]},0 0 90px ${p[1]}}body.ewm-live11 .w8-nebula{opacity:1;animation-duration:5s}body.ewm-live11:after{content:"";position:fixed;inset:0;z-index:9997;pointer-events:none;background:radial-gradient(circle at 50% 50%,${p[0]}12,transparent 55%);animation:l11Pulse 1.2s ease-out}@keyframes l11Pulse{0%{opacity:0}35%{opacity:1}100%{opacity:0}}`;
document.head.appendChild(st);
const wake=()=>{document.body.classList.add('ewm-live11');clearTimeout(window.__ewmLiveTimer);window.__ewmLiveTimer=setTimeout(()=>document.body.classList.remove('ewm-live11'),2600)};
document.addEventListener('click',e=>{if(e.target.closest?.('#ewm-cine10,.ap4-portal,.ap4-enter,.g7-body,.g7-core'))wake()},{passive:true});
window.addEventListener('ewm:portal-activated',wake); 
})();
