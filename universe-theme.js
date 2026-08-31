/* Shared 3D layer. Additive only: never replaces existing app logic. */
(function(){
'use strict';
const p=(location.pathname||'').toLowerCase();
const grade=p.includes('grade3')?'grade3':p.includes('grade2')?'grade2':p.includes('grade4')?'grade4':'home';
document.documentElement.dataset.universe=grade;
document.body.classList.add('u-universe',`u-${grade}`);
const candidates='.lesson,.stat,.card,.grade-card,.grade,.portal,.feature-card,.mission-card';
const worlds=['hello','numbers','colors','family','home','animals','food','school','weather','body','feelings','review'];
function decorate(root=document){
 root.querySelectorAll(candidates).forEach((el,i)=>{
  if(el.classList.contains('u-holo')) return;
  el.classList.add('u-holo');
  el.style.setProperty('--u-delay',`${(i%12)*55}ms`);
  if(grade==='grade2' && el.classList.contains('lesson') && !el.querySelector('.u-scene')){
   const scene=document.createElement('span');
   scene.className='u-scene';
   scene.dataset.world=worlds[i%worlds.length];
   scene.setAttribute('aria-hidden','true');
   el.appendChild(scene);
  }
 });
}
decorate();
const observer=new MutationObserver(m=>{for(const x of m)for(const n of x.addedNodes)if(n.nodeType===1)decorate(n);});
observer.observe(document.body,{childList:true,subtree:true});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
if(!reduce.matches){
 document.addEventListener('pointermove',e=>{const t=e.target.closest?.('.u-holo');if(!t||window.innerWidth<800)return;const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform=`perspective(700px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg) translateY(-5px)`},{passive:true});
 document.addEventListener('pointerout',e=>{const t=e.target.closest?.('.u-holo');if(t&&(!e.relatedTarget||!t.contains(e.relatedTarget)))t.style.transform=''},{passive:true});
}
})();
