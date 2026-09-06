/* GRADE 2 — magical AI companion + reactive cursor behavior */
(function(){'use strict';
function init(){
  if(Number(document.body.dataset.grade)!==2)return;
  const body=document.body,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=!matchMedia('(pointer:coarse)').matches;
  let cursorX=innerWidth/2,cursorY=innerHeight/2;
  if(fine&&!reduce){
    const ring=document.createElement('div'),dot=document.createElement('div');ring.className='g2-cursor';dot.className='g2-cursor-dot';body.append(ring,dot);
    let tx=cursorX,ty=cursorY,x=tx,y=ty;
    addEventListener('mousemove',e=>{cursorX=e.clientX;cursorY=e.clientY;tx=e.clientX;ty=e.clientY});
    function frame(){x+=(tx-x)*.18;y+=(ty-y)*.18;ring.style.left=x+'px';ring.style.top=y+'px';dot.style.left=tx+'px';dot.style.top=ty+'px';requestAnimationFrame(frame)}frame();
    document.addEventListener('mouseover',e=>{if(e.target.closest('button,a,.wordbtn,.world'))ring.classList.add('hover')});
    document.addEventListener('mouseout',e=>{if(e.target.closest('button,a,.wordbtn,.world'))ring.classList.remove('hover')});
  }else if(fine)addEventListener('mousemove',e=>{cursorX=e.clientX;cursorY=e.clientY});
  function state(name,ms){body.classList.remove('g2-ai-think','g2-ai-happy','g2-ai-alert','g2-ai-mission');body.classList.add('g2-ai-'+name);if(ms)setTimeout(()=>body.classList.remove('g2-ai-'+name),ms)}
  function launch(el){
    const target=el.closest('.world,[data-m]')||el;if(!target)return;
    const r=target.getBoundingClientRect();
    const fx=document.createElement('div');fx.className='g2-mission-launch';fx.style.left=(r.left+r.width/2)+'px';fx.style.top=(r.top+r.height/2)+'px';body.appendChild(fx);
    setTimeout(()=>fx.remove(),800);state('mission',850);
  }
  document.addEventListener('click',e=>{
    const el=e.target.closest('button,a');if(!el)return;
    if(el.matches('.world,[data-m]'))launch(el);
    if(el.matches('.choice[data-answer="right"]'))state('happy',1200);
    if(el.matches('.choice[data-answer="wrong"]'))state('alert',1000);
    if(el.hasAttribute('data-save-answer'))state('happy',1000);
  });
  document.addEventListener('focusin',e=>{if(e.target.matches('textarea,input'))state('think',0)});
  document.addEventListener('focusout',e=>{if(e.target.matches('textarea,input'))body.classList.remove('g2-ai-think')});
  addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('.choice'))state('happy',900)});
  if(reduce)return;
  let robot=null,lastSpark=0,phase=Math.random()*10;const sparks=[];
  function queryRobot(){const next=document.querySelector('body[data-grade="2"] .hero .robot');if(next!==robot){robot=next;if(robot)robot.style.translate='0 0'}return robot}
  function spark(){if(!robot||sparks.length>=18)return;const r=robot.getBoundingClientRect(),s=document.createElement('i');s.className='g2-xenon-spark';s.style.left=(r.left+r.width*.5+(Math.random()-.5)*18)+'px';s.style.top=(r.top+r.height*.72+(Math.random()-.5)*12)+'px';s.style.setProperty('--sx',((Math.random()-.5)*28)+'px');s.style.setProperty('--sy',(8+Math.random()*26)+'px');body.appendChild(s);sparks.push(s);setTimeout(()=>{s.remove();const i=sparks.indexOf(s);if(i>=0)sparks.splice(i,1)},900)}
  let last=performance.now();function flight(now){const dt=Math.min(32,now-last);last=now;const r=queryRobot();if(r){phase+=dt*.00035;const dx0=Math.sin(phase*.83)*13+Math.sin(phase*1.71)*5,dy0=Math.cos(phase*.67)*10+Math.sin(phase*1.43)*4;let dx=dx0,dy=dy0;if(fine){const b=r.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2,vx=cx-cursorX,vy=cy-cursorY,d=Math.hypot(vx,vy);if(d<210&&d>1){const f=(210-d)/210;dx+=(vx/d)*f*22;dy+=(vy/d)*f*22}}r.style.translate=Math.max(-34,Math.min(34,dx)).toFixed(2)+'px '+Math.max(-28,Math.min(28,dy)).toFixed(2)+'px';if(now-lastSpark>78){lastSpark=now;spark()}}requestAnimationFrame(flight)}
  requestAnimationFrame(flight);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
