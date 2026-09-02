/* Futuristic Learning Universe MAX interaction layer */
(function(){'use strict';
const path=(location.pathname||'').toLowerCase();
const grade=path.includes('grade4')?'4':path.includes('grade3')?'3':path.includes('grade2')?'2':'home';
const root=document.documentElement, body=document.body;
root.dataset.universeMax=grade; body.classList.add('u-universe','u-grade-'+grade);
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function installQuizObjectDisplayFix(){
  if(window.__EWM_QUIZ_OBJECT_DISPLAY_FIX__||!['2','3','4'].includes(grade))return;
  window.__EWM_QUIZ_OBJECT_DISPLAY_FIX__=true;
  const native=Object.prototype.toString;
  const keys=['text','label','value','option','answer','word','translation','prompt','name','title'];
  try{Object.defineProperty(Object.prototype,'toString',{configurable:true,writable:true,value:function(){
    const o=this;
    if(o&&typeof o==='object'){
      for(const k of keys){if(Object.prototype.hasOwnProperty.call(o,k)&&o[k]!==null&&o[k]!==undefined&&(typeof o[k]==='string'||typeof o[k]==='number'||typeof o[k]==='boolean'))return String(o[k]);}
      const own=Object.keys(o);
      if(own.length===1){const v=o[own[0]];if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return String(v);}
    }
    return native.call(o);
  }});}catch(e){console.warn('[EWM Quiz Display Fix]',e)}
}
function addParticles(){if(document.querySelector('.u-max-particles'))return;const box=document.createElement('div');box.className='u-max-particles';box.setAttribute('aria-hidden','true');for(let i=0;i<18;i++)box.appendChild(document.createElement('i'));document.body.appendChild(box)}
function addHud(){if(document.querySelector('.u-max-hud'))return;const hud=document.createElement('div');hud.className='u-max-hud';hud.innerHTML='<span class="u-max-dot"></span><span>UNIVERSE ONLINE • <b>GRADE '+(grade==='home'?'HUB':grade)+'</b></span>';document.body.appendChild(hud)}
/* Grade navigation is now centralized on the Academy hub. */
function addNav(){}
function decorate(){const q='.lesson,.mission,.card,.grade-card,.grade,.feature-card,.mission-card,.info-card,.daily-card,.stats strong,.hero-core,.planet,.core';document.querySelectorAll(q).forEach((el,i)=>{el.classList.add('u-holo');el.style.setProperty('--u-delay',(i%16)*45+'ms');el.dataset.uDepth='1';});}
function robotFX(){if(reduced)return;const robot=document.querySelector('.ai-robot');if(!robot)return;robot.style.touchAction='manipulation';function move(x,y){const r=robot.getBoundingClientRect();const px=(x-r.left)/r.width-.5,py=(y-r.top)/r.height-.5;robot.style.setProperty('--robot-rx',(-py*9).toFixed(2)+'deg');robot.style.setProperty('--robot-ry',(px*12).toFixed(2)+'deg');robot.classList.add('robot-interactive')}function reset(){robot.style.removeProperty('--robot-rx');robot.style.removeProperty('--robot-ry');robot.classList.remove('robot-interactive');robot.classList.remove('robot-touched')}robot.addEventListener('pointerenter',()=>robot.classList.add('robot-interactive'),{passive:true});robot.addEventListener('pointermove',e=>move(e.clientX,e.clientY),{passive:true});robot.addEventListener('pointerleave',reset,{passive:true});robot.addEventListener('pointerdown',e=>{move(e.clientX,e.clientY);robot.classList.add('robot-touched')},{passive:true});robot.addEventListener('pointerup',()=>robot.classList.remove('robot-touched'),{passive:true});robot.addEventListener('pointercancel',reset,{passive:true})}
function addRobotCompanion(){
  if(document.querySelector('.u-robot-companion')||grade==='home')return;
  const r=document.createElement('div');
  r.className='u-robot-companion';
  r.setAttribute('aria-hidden','true');
  r.innerHTML='<span class="u-rc-aura"></span><span class="u-rc-body"><span class="u-rc-eye e1"></span><span class="u-rc-eye e2"></span><span class="u-rc-mouth"></span></span>';
  document.body.appendChild(r);
  const half=24;
  let tx=window.innerWidth-half,ty=window.innerHeight-half,x=tx,y=ty,active=false,lastFrame=performance.now();
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function target(px,py){tx=clamp(px,half,window.innerWidth-half);ty=clamp(py,half,window.innerHeight-half);active=true;r.classList.add('u-rc-active')}
  function follow(now){const dt=Math.min(40,Math.max(8,now-lastFrame));lastFrame=now;if(active){if(reduced){x=tx;y=ty}else{const alpha=1-Math.pow(1-.28,dt/16.67);x+=(tx-x)*alpha;y+=(ty-y)*alpha}r.style.transform='translate3d('+(x-half)+'px,'+(y-half)+'px,0)'}requestAnimationFrame(follow)}
  function handlePointer(e){if(e.pointerType==='touch'||e.pointerType==='pen'||e.pointerType==='mouse')target(e.clientX,e.clientY)}
  window.addEventListener('pointermove',handlePointer,{passive:true});
  window.addEventListener('pointerdown',handlePointer,{passive:true});
  window.addEventListener('touchmove',e=>{const t=e.touches&&e.touches[0];if(t)target(t.clientX,t.clientY)},{passive:true});
  window.addEventListener('touchstart',e=>{const t=e.touches&&e.touches[0];if(t)target(t.clientX,t.clientY)},{passive:true});
  window.addEventListener('resize',()=>{tx=clamp(tx,half,innerWidth-half);ty=clamp(ty,half,innerHeight-half);x=clamp(x,half,innerWidth-half);y=clamp(y,half,innerHeight-half)},{passive:true});
  requestAnimationFrame(follow);
}
function init(){installQuizObjectDisplayFix();addParticles();addHud();addNav();decorate();addRobotCompanion();new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)decorate()}))).observe(document.body,{childList:true,subtree:true});robotFX()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();