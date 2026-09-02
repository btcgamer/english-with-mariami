/* English with Mariami — shared AI Magic Companion. Visual-only enhancement. */
(function(){'use strict';
if(window.__AI_MAGIC_COMPANION__)return;window.__AI_MAGIC_COMPANION__=true;
var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var root=document.body;if(!root)return;
var aura=document.createElement('div');aura.className='ai-magic-aura';root.appendChild(aura);
var label=document.createElement('div');label.className='ai-magic-label';label.textContent='✦ AI MAGIC COMPANION';root.appendChild(label);
var lastX=-100,lastY=-100,raf=0;
function move(x,y){lastX=x;lastY=y;if(raf)return;raf=requestAnimationFrame(function(){raf=0;aura.style.transform='translate3d('+x+'px,'+y+'px,0)';label.style.transform='translate3d('+(x+14)+'px,'+(y+18)+'px,0)';aura.classList.add('is-visible');label.classList.add('is-visible')})}
function spark(x,y){if(reduced)return;var s=document.createElement('i');s.className='ai-magic-spark';s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--dx',(Math.random()*44-22)+'px');s.style.setProperty('--dy',(Math.random()*44-22)+'px');root.appendChild(s);setTimeout(function(){s.remove()},850)}
function burst(x,y){var b=document.createElement('i');b.className='ai-magic-burst';b.style.left=x+'px';b.style.top=y+'px';root.appendChild(b);setTimeout(function(){b.remove()},700)}
document.addEventListener('pointermove',function(e){move(e.clientX,e.clientY);if(e.pointerType==='mouse'&&Math.random()<.13)spark(e.clientX,e.clientY)},{passive:true});
document.addEventListener('pointerdown',function(e){move(e.clientX,e.clientY);burst(e.clientX,e.clientY);for(var i=0;i<3;i++)spark(e.clientX,e.clientY)},{passive:true});
document.addEventListener('touchstart',function(e){var t=e.touches[0];if(t){move(t.clientX,t.clientY);burst(t.clientX,t.clientY)}},{passive:true});
document.addEventListener('touchmove',function(e){var t=e.touches[0];if(t)move(t.clientX,t.clientY)},{passive:true});
document.addEventListener('pointerleave',function(){aura.classList.remove('is-visible');label.classList.remove('is-visible')});
var robots=document.querySelectorAll('.ai-robot,.hero-orbit,.core');robots.forEach(function(r){if(!r.querySelector('.ai-magic-portal')){var p=document.createElement('span');p.className='ai-magic-portal';p.setAttribute('aria-hidden','true');r.appendChild(p)}});
})();
