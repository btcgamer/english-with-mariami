/* Unified mission deep-link router for Grade 2/3/4 — V5 */
(function(){'use strict';
const m=location.search.match(/[?&]mission=(\d+)/i);if(!m)return;
const grade=(location.pathname.match(/grade([234])/i)||[])[1];
const mission=Number(m[1]);if(!grade||mission<1)return;
const max=60;if(mission>max)return;
const key=`magic-neon-grade-${grade}`;
try{
 const s=JSON.parse(localStorage.getItem(key)||'{}');
 localStorage.setItem(key,JSON.stringify({...s,current:mission}));
 window.dispatchEvent(new CustomEvent('englishMariamiMissionRoute',{detail:{grade:Number(grade),mission}}));
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const show=()=>{
  if(document.getElementById('mwp-arrival'))return;
  const el=document.createElement('div');el.id='mwp-arrival';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  el.innerHTML=`<div class="mwp-arrival-core"><span class="mwp-arrival-ring"></span><span class="mwp-arrival-orb">🚀</span></div><small>MAGIC WORLD • GRADE ${grade}</small><strong>MISSION ${mission} ARRIVAL</strong><i></i><em>GATEWAY CONNECTED</em>`;
  const css=document.createElement('style');css.textContent='#mwp-arrival{position:fixed;inset:0;z-index:999999;display:grid;place-items:center;align-content:center;gap:9px;background:radial-gradient(circle at 50% 48%,rgba(0,234,255,.14),rgba(1,5,18,.97) 55%);color:#fff;font-family:Arial,sans-serif;text-align:center;pointer-events:none;animation:mwpArrivalIn .34s ease-out both}#mwp-arrival .mwp-arrival-core{position:relative;width:92px;height:92px;display:grid;place-items:center}#mwp-arrival .mwp-arrival-ring{position:absolute;inset:3px;border:1px solid rgba(0,234,255,.75);border-radius:50%;box-shadow:0 0 30px rgba(0,234,255,.35);animation:mwpArrivalSpin .72s linear infinite}#mwp-arrival .mwp-arrival-ring:after{content:"";position:absolute;inset:12px;border:1px dashed rgba(139,92,246,.7);border-radius:50%}#mwp-arrival .mwp-arrival-orb{font-size:32px;filter:drop-shadow(0 0 14px rgba(0,234,255,.7));animation:mwpArrivalPulse .6s ease-in-out infinite alternate}#mwp-arrival small{color:#65eaff;letter-spacing:2.4px;font-size:10px;font-weight:900}#mwp-arrival strong{font-size:23px;letter-spacing:1px;text-shadow:0 0 20px rgba(0,234,255,.35)}#mwp-arrival i{display:block;width:min(280px,70vw);height:3px;border-radius:9px;background:linear-gradient(90deg,transparent,#00eaff,transparent);box-shadow:0 0 16px rgba(0,234,255,.6);animation:mwpArrivalBeam .65s ease-out both}#mwp-arrival em{font-style:normal;color:#8aa6b5;font-size:9px;letter-spacing:1.5px;font-weight:900}@keyframes mwpArrivalSpin{to{transform:rotate(360deg)}}@keyframes mwpArrivalPulse{to{transform:scale(1.1)}}@keyframes mwpArrivalBeam{from{transform:scaleX(.05);opacity:.2}to{transform:scaleX(1);opacity:1}}@keyframes mwpArrivalIn{from{opacity:0}to{opacity:1}}@media(max-width:600px){#mwp-arrival strong{font-size:19px}}@media(prefers-reduced-motion:reduce){#mwp-arrival,#mwp-arrival .mwp-arrival-ring,#mwp-arrival .mwp-arrival-orb,#mwp-arrival i{animation:none}}';document.head.appendChild(css);document.body.appendChild(el);
  const delay=reduce?80:520;window.setTimeout(()=>el.remove(),delay);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();
}catch(_){}
})();