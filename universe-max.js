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
/* Only the AI robot reacts to mouse/touch. Learning cards do not move. */
function robotFX(){
  if(reduced)return;
  const robot=document.querySelector('.ai-robot');
  if(!robot)return;
  robot.style.touchAction='manipulation';
  function move(x,y){
    const r=robot.getBoundingClientRect();
    const px=(x-r.left)/r.width-.5, py=(y-r.top)/r.height-.5;
    robot.style.setProperty('--robot-rx',(-py*9).toFixed(2)+'deg');
    robot.style.setProperty('--robot-ry',(px*12).toFixed(2)+'deg');
    robot.classList.add('robot-interactive');
  }
  function reset(){robot.style.removeProperty('--robot-rx');robot.style.removeProperty('--robot-ry');robot.classList.remove('robot-interactive');robot.classList.remove('robot-touched');}
  robot.addEventListener('pointerenter',()=>robot.classList.add('robot-interactive'),{passive:true});
  robot.addEventListener('pointermove',e=>move(e.clientX,e.clientY),{passive:true});
  robot.addEventListener('pointerleave',reset,{passive:true});
  robot.addEventListener('pointerdown',e=>{move(e.clientX,e.clientY);robot.classList.add('robot-touched')},{passive:true});
  robot.addEventListener('pointerup',()=>robot.classList.remove('robot-touched'),{passive:true});
  robot.addEventListener('pointercancel',reset,{passive:true});
}
function init(){addParticles();addHud();addNav();decorate();new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)decorate()}))).observe(document.body,{childList:true,subtree:true});robotFX();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
