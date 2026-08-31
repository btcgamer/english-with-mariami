/* English with Mariami — Futuristic Learning Universe interaction layer */
(function(){'use strict';
const p=(location.pathname||'').toLowerCase();
const grade=p.includes('grade4')?'grade4':p.includes('grade3')?'grade3':p.includes('grade2')?'grade2':'home';
document.documentElement.dataset.universe=grade; document.body.classList.add('u-universe','u-'+grade);
const candidates='.lesson,.stat,.card,.grade-card,.grade,.portal,.feature-card,.mission-card,.mission,.info-card,.daily-card';
function decorate(root=document){root.querySelectorAll(candidates).forEach((el,i)=>{if(el.classList.contains('u-holo'))return;el.classList.add('u-holo');el.style.setProperty('--u-delay',`${(i%12)*55}ms`);});}
decorate(); new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)decorate(n)}))).observe(document.body,{childList:true,subtree:true});
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reduce.matches){document.addEventListener('pointermove',e=>{if(innerWidth<800)return;const t=e.target.closest?.('.u-holo');if(!t)return;const r=t.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform=`perspective(800px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-7px) scale(1.012)`;t.style.setProperty('--u-mx',`${(x+.5)*100}%`);t.style.setProperty('--u-my',`${(y+.5)*100}%`)},{passive:true});document.addEventListener('pointerout',e=>{const t=e.target.closest?.('.u-holo');if(t&&(!e.relatedTarget||!t.contains(e.relatedTarget))){t.style.transform='';t.style.removeProperty('--u-mx');t.style.removeProperty('--u-my')}},{passive:true});}
})();
