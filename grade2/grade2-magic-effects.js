/* GRADE 2 — magical AI companion + reactive cursor behavior + personality layer */
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
  let bubble=null,bubbleTimer=0;
  function ensureBubble(){
    if(bubble&&bubble.isConnected)return bubble;
    bubble=document.createElement('div');bubble.className='g2-ai-hologram';bubble.setAttribute('aria-live','polite');bubble.setAttribute('aria-hidden','true');body.appendChild(bubble);return bubble;
  }
  const messages={ready:'AI READY',mission:'MISSION READY',happy:'GREAT WORK ✦',alert:'TRY AGAIN',think:'I\'M THINKING...',complete:'MISSION COMPLETE ✦'};
  function personality(kind,ms){
    const b=ensureBubble();b.textContent=messages[kind]||messages.ready;b.className='g2-ai-hologram g2-ai-holo-'+kind;b.classList.add('show');clearTimeout(bubbleTimer);
    if(ms)bubbleTimer=setTimeout(()=>b.classList.remove('show'),ms);
  }
  function state(name,ms){body.classList.remove('g2-ai-think','g2-ai-happy','g2-ai-alert','g2-ai-mission','g2-ai-complete');body.classList.add('g2-ai-'+name);personality(name,ms||0);if(ms)setTimeout(()=>body.classList.remove('g2-ai-'+name),ms)}
  function celebration(){
    const count=reduce?0:18;
    for(let i=0;i<count;i++){
      const s=document.createElement('i');s.className='g2-celebration-spark';s.style.left=(50+(Math.random()-.5)*12)+'vw';s.style.top=(28+(Math.random()-.5)*12)+'vh';s.style.setProperty('--sx',((Math.random()-.5)*260)+'px');s.style.setProperty('--sy',((Math.random()-.65)*220)+'px');s.style.setProperty('--delay',(Math.random()*.18)+'s');body.appendChild(s);setTimeout(()=>s.remove(),1050);
    }
    const burst=document.createElement('div');burst.className='g2-completion-burst';body.appendChild(burst);setTimeout(()=>burst.remove(),1100);
  }
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
    if(el.matches('[data-complete],[data-finish],[data-next-mission]')){state('complete',1300);celebration()}
  });
  document.addEventListener('focusin',e=>{if(e.target.matches('textarea,input'))state('think',0)});
  document.addEventListener('focusout',e=>{if(e.target.matches('textarea,input')){body.classList.remove('g2-ai-think');personality('ready',900)}});
  addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('.choice'))state('happy',900)});
  const observer=new MutationObserver(()=>{if(body.classList.contains('g2-ai-complete'))personality('complete',1200)});observer.observe(body,{childList:true,subtree:true});
  if(reduce)return;
  let robot=null,lastSpark=0,phase=Math.random()*10;const sparks=[];
  function queryRobot(){const next=document.querySelector('body[data-grade="2"] .hero .robot');if(next!==robot){robot=next;if(robot)robot.style.translate='0 0'}return robot}
  function spark(){if(!robot||sparks.length>=18)return;const r=robot.getBoundingClientRect(),s=document.createElement('i');s.className='g2-xenon-spark';s.style.left=(r.left+r.width*.5+(Math.random()-.5)*18)+'px';s.style.top=(r.top+r.height*.72+(Math.random()-.5)*12)+'px';s.style.setProperty('--sx',((Math.random()-.5)*28)+'px');s.style.setProperty('--sy',(8+Math.random()*26)+'px');body.appendChild(s);sparks.push(s);setTimeout(()=>{s.remove();const i=sparks.indexOf(s);if(i>=0)sparks.splice(i,1)},900)}
  let last=performance.now();function flight(now){const dt=Math.min(32,now-last);last=now;const r=queryRobot();if(r){phase+=dt*.00035;const dx0=Math.sin(phase*.83)*13+Math.sin(phase*1.71)*5,dy0=Math.cos(phase*.67)*10+Math.sin(phase*1.43)*4;let dx=dx0,dy=dy0;if(fine){const b=r.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2,vx=cx-cursorX,vy=cy-cursorY,d=Math.hypot(vx,vy);if(d<210&&d>1){const f=(210-d)/210;dx+=(vx/d)*f*22;dy+=(vy/d)*f*22}}r.style.translate=Math.max(-34,Math.min(34,dx)).toFixed(2)+'px '+Math.max(-28,Math.min(28,dy)).toFixed(2)+'px';if(now-lastSpark>78){lastSpark=now;spark()}}requestAnimationFrame(flight)}
  requestAnimationFrame(flight);
  personality('ready',1600);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
