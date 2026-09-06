/* GRADE 2 — magical AI companion + reactive cursor behavior */
(function(){'use strict';
function init(){
  if(Number(document.body.dataset.grade)!==2)return;
  const body=document.body;
  if(!matchMedia('(pointer:coarse)').matches){
    const ring=document.createElement('div'),dot=document.createElement('div');
    ring.className='g2-cursor';dot.className='g2-cursor-dot';body.append(ring,dot);
    let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty;
    addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY});
    function frame(){x+=(tx-x)*.18;y+=(ty-y)*.18;ring.style.left=x+'px';ring.style.top=y+'px';dot.style.left=tx+'px';dot.style.top=ty+'px';requestAnimationFrame(frame)}frame();
    document.addEventListener('mouseover',e=>{if(e.target.closest('button,a,.wordbtn,.world'))ring.classList.add('hover')});
    document.addEventListener('mouseout',e=>{if(e.target.closest('button,a,.wordbtn,.world'))ring.classList.remove('hover')});
  }
  function state(name,ms){body.classList.remove('g2-ai-think','g2-ai-happy','g2-ai-alert','g2-ai-mission');body.classList.add('g2-ai-'+name);if(ms)setTimeout(()=>body.classList.remove('g2-ai-'+name),ms)}
  document.addEventListener('click',e=>{
    const el=e.target.closest('button,a');if(!el)return;
    if(el.matches('.world,[data-m]'))state('mission',850);
    if(el.matches('.choice[data-answer="right"]'))state('happy',1200);
    if(el.matches('.choice[data-answer="wrong"]'))state('alert',1000);
    if(el.hasAttribute('data-save-answer'))state('happy',1000);
  });
  document.addEventListener('focusin',e=>{if(e.target.matches('textarea,input'))state('think',0)});
  document.addEventListener('focusout',e=>{if(e.target.matches('textarea,input'))body.classList.remove('g2-ai-think')});
  addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('.choice'))state('happy',900)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
