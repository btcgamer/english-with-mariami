/* Futuristic Learning Universe MAX interaction layer */
(function(){'use strict';
const path=(location.pathname||'').toLowerCase();
const grade=path.includes('grade4')?'4':path.includes('grade3')?'3':path.includes('grade2')?'2':'home';
const root=document.documentElement, body=document.body;
root.dataset.universeMax=grade; body.classList.add('u-universe','u-grade-'+grade);
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function addParticles(){if(document.querySelector('.u-max-particles'))return;const box=document.createElement('div');box.className='u-max-particles';box.setAttribute('aria-hidden','true');for(let i=0;i<18;i++)box.appendChild(document.createElement('i'));document.body.appendChild(box)}
function addHud(){if(document.querySelector('.u-max-hud'))return;const hud=document.createElement('div');hud.className='u-max-hud';hud.innerHTML='<span class="u-max-dot"></span><span>UNIVERSE ONLINE • <b>GRADE '+(grade==='home'?'HUB':grade)+'</b></span>';document.body.appendChild(hud)}
function addNav(){if(grade==='home'||document.querySelector('.u-max-nav'))return;const n=document.createElement('nav');n.className='u-max-nav';n.setAttribute('aria-label','Learning Universe');n.innerHTML='<a href="../index.html">⌂ HUB</a><a href="../grade2/">G2</a><a href="../grade3/">G3</a><a href="../grade4/">G4</a>';document.body.appendChild(n)}
function decorate(){const q='.lesson,.mission,.card,.grade-card,.grade,.feature-card,.mission-card,.info-card,.daily-card,.stats strong,.hero-core,.planet,.core';document.querySelectorAll(q).forEach((el,i)=>{el.classList.add('u-holo');el.style.setProperty('--u-delay',(i%16)*45+'ms');el.dataset.uDepth='1';});}
function pointerFX(){
  /* Grade 3/4 already load universe-theme.js, which owns the pointer effect. */
  if(root.dataset.universe)return;
  if(reduced)return;
  let active=null;
  document.addEventListener('pointermove',e=>{if(innerWidth<760)return;const t=e.target.closest?.('.u-holo');if(!t)return;active=t;const r=t.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;const rx=(-y*7).toFixed(2),ry=(x*8).toFixed(2);t.style.setProperty('--u-mx',((x+.5)*100)+'%');t.style.setProperty('--u-my',((y+.5)*100)+'%');t.style.transform='perspective(1000px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-7px) translateZ(8px) scale(1.014)';},{passive:true});
  document.addEventListener('pointerout',e=>{const t=e.target.closest?.('.u-holo');if(t&&(!e.relatedTarget||!t.contains(e.relatedTarget))){t.style.transform='';t.style.removeProperty('--u-mx');t.style.removeProperty('--u-my');if(active===t)active=null;}},{passive:true})
}
function init(){addParticles();addHud();addNav();decorate();new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)decorate()}))).observe(document.body,{childList:true,subtree:true});pointerFX();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
