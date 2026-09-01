/* Grade 3 — AI Companion + SVG learning element.
   Safe UI-only layer: no progress, auth or Supabase changes. */
(function(){'use strict';
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(document.querySelector('.g3-ai-companion')) return;
  const style=document.createElement('style');
  style.textContent=`
.g3-ai-companion{position:fixed;right:18px;bottom:18px;width:74px;height:74px;z-index:2147483640;pointer-events:none;opacity:0;transform:translate3d(0,18px,0) scale(.92);transition:opacity .25s ease,transform .25s ease;filter:drop-shadow(0 0 12px rgba(0,229,255,.7))}.g3-ai-companion.ready{opacity:1;transform:translate3d(0,0,0) scale(1)}.g3-ai-companion svg{width:100%;height:100%;overflow:visible}.g3-ai-companion .orbit{transform-origin:50% 50%;animation:g3Orbit 5s linear infinite}.g3-ai-companion .pulse{transform-origin:50% 50%;animation:g3Pulse 1.8s ease-in-out infinite}.g3-ai-companion .eye{animation:g3Blink 4.5s infinite}.g3-ai-companion .bubble{position:absolute;right:66px;bottom:50px;min-width:150px;max-width:230px;padding:8px 11px;border:1px solid rgba(0,229,255,.5);border-radius:12px;background:rgba(3,8,25,.94);color:#e8fbff;font:600 12px/1.35 system-ui,sans-serif;box-shadow:0 0 18px rgba(0,229,255,.18);opacity:0;transform:translateY(6px);transition:.2s ease}.g3-ai-companion.show-tip .bubble{opacity:1;transform:translateY(0)}
@keyframes g3Orbit{to{transform:rotate(360deg)}}@keyframes g3Pulse{50%{transform:scale(1.08);opacity:.72}}@keyframes g3Blink{0%,45%,47%,100%{transform:scaleY(1)}46%{transform:scaleY(.12)}}
@media(max-width:600px){.g3-ai-companion{right:10px;bottom:10px;width:58px;height:58px}.g3-ai-companion .bubble{right:48px;bottom:38px;min-width:125px;max-width:190px;font-size:11px}}
@media(prefers-reduced-motion:reduce){.g3-ai-companion,.g3-ai-companion .orbit,.g3-ai-companion .pulse,.g3-ai-companion .eye{animation:none;transition:none}}
`;
  document.head.appendChild(style);
  const el=document.createElement('div');
  el.className='g3-ai-companion';
  el.setAttribute('aria-hidden','true');
  el.innerHTML=`<div class="bubble">I’m with you — choose a mission and keep going! 🚀</div><svg viewBox="0 0 100 100" role="presentation"><g class="orbit" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".72"><ellipse cx="50" cy="50" rx="44" ry="17"/><ellipse cx="50" cy="50" rx="17" ry="44"/></g><circle class="pulse" cx="50" cy="50" r="31" fill="rgba(3,12,32,.96)" stroke="#00e5ff" stroke-width="2.5"/><path d="M50 12v9M46 12h8" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="10" r="3" fill="#00e5ff"/><rect x="29" y="34" width="42" height="30" rx="11" fill="rgba(8,20,48,.98)" stroke="#8b5cf6" stroke-width="2"/><circle class="eye" cx="42" cy="48" r="3.4" fill="#fff"/><circle class="eye" cx="58" cy="48" r="3.4" fill="#fff"/><path d="M42 56q8 6 16 0" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round"/></svg>`;
  document.body.appendChild(el);
  const bubble=el.querySelector('.bubble');
  const tips=['You can do it! 🚀','Read the words aloud. 🗣️','Listen, repeat, then answer. 🎧','Look for the grammar pattern. 🧠','One mission at a time! ⭐'];
  let timer=0,tx=0,ty=0,raf=0;
  function tip(text){bubble.textContent=text;el.classList.add('show-tip');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show-tip'),2200)}
  function move(x,y){if(reduced)return;tx=Math.max(-12,Math.min(12,(x-window.innerWidth/2)/45));ty=Math.max(-10,Math.min(10,(y-window.innerHeight/2)/55));if(raf)return;raf=requestAnimationFrame(()=>{raf=0;el.style.marginRight=tx+'px';el.style.marginBottom=ty+'px'})}
  document.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')move(e.clientX,e.clientY)},{passive:true});
  document.addEventListener('pointerdown',e=>{move(e.clientX,e.clientY);tip(tips[Math.floor(Math.random()*tips.length)])},{passive:true});
  document.addEventListener('click',e=>{const card=e.target.closest('.mission');if(card)tip('Great choice! Open this sector and start learning. ✦')},{passive:true});
  el.classList.add('ready');
})();