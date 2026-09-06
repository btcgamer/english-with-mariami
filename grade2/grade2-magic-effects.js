/* GRADE 2 — magical AI cursor + floating companion behavior */
(function(){'use strict';
function init(){
  if(Number(document.body.dataset.grade)!==2)return;
  if(matchMedia('(pointer:coarse)').matches)return;
  const ring=document.createElement('div'),dot=document.createElement('div');
  ring.className='g2-cursor';dot.className='g2-cursor-dot';document.body.append(ring,dot);
  let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty;
  addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY});
  function frame(){x+=(tx-x)*.18;y+=(ty-y)*.18;ring.style.left=x+'px';ring.style.top=y+'px';dot.style.left=tx+'px';dot.style.top=ty+'px';requestAnimationFrame(frame)}frame();
  document.addEventListener('mouseover',e=>{if(e.target.closest('button,a,.wordbtn,.world'))ring.classList.add('hover')});
  document.addEventListener('mouseout',e=>{if(e.target.closest('button,a,.wordbtn,.world'))ring.classList.remove('hover')});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
