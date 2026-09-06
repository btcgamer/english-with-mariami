/* GRADE 2 — magical AI companion + reactive cursor + personality + learning memory */
(function(){'use strict';
function init(){
  if(Number(document.body.dataset.grade)!==2)return;
  const body=document.body,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=!matchMedia('(pointer:coarse)').matches;
  const key='magic-neon-grade-2',memoryKey='magic-neon-grade-2-ai-memory';
  let cursorX=innerWidth/2,cursorY=innerHeight/2;
  if(fine&&!reduce){
    const ring=document.createElement('div'),dot=document.createElement('div');ring.className='g2-cursor';dot.className='g2-cursor-dot';body.append(ring,dot);
    let tx=cursorX,ty=cursorY,x=tx,y=ty;addEventListener('mousemove',e=>{cursorX=e.clientX;cursorY=e.clientY;tx=e.clientX;ty=e.clientY});
    function frame(){x+=(tx-x)*.18;y+=(ty-y)*.18;ring.style.left=x+'px';ring.style.top=y+'px';dot.style.left=tx+'px';dot.style.top=ty+'px';requestAnimationFrame(frame)}frame();
    document.addEventListener('mouseover',e=>{if(e.target.closest('button,a,.wordbtn,.world'))ring.classList.add('hover')});
    document.addEventListener('mouseout',e=>{if(e.target.closest('button,a,.wordbtn,.world'))ring.classList.remove('hover')});
  }else if(fine)addEventListener('mousemove',e=>{cursorX=e.clientX;cursorY=e.clientY});
  function readMemory(){try{const m=JSON.parse(localStorage.getItem(memoryKey)||'null');return m&&typeof m==='object'?{correct:Number(m.correct)||0,wrong:Number(m.wrong)||0,completed:Number(m.completed)||0,lastOutcome:m.lastOutcome||'ready',lastMission:Number(m.lastMission)||0}:null}catch(e){return null}}
  function writeMemory(patch){try{const m={correct:0,wrong:0,completed:0,lastOutcome:'ready',lastMission:0,...(readMemory()||{}),...patch};localStorage.setItem(memoryKey,JSON.stringify(m));return m}catch(e){return null}}
  function currentState(){try{const s=JSON.parse(localStorage.getItem(key)||'null');return s&&typeof s==='object'?s:null}catch(e){return null}}
  let bubble=null,bubbleTimer=0;
  function ensureBubble(){if(bubble&&bubble.isConnected)return bubble;bubble=document.createElement('div');bubble.className='g2-ai-hologram';bubble.setAttribute('aria-live','polite');bubble.setAttribute('aria-hidden','true');body.appendChild(bubble);return bubble}
  const messages={ready:'AI READY',mission:'MISSION READY',happy:'GREAT WORK ✦',alert:'TRY AGAIN',think:'I\'M THINKING...',complete:'MISSION COMPLETE ✦',encourage:'KEEP GOING ✦',mastery:'SKILL BOOSTED ✦'};
  function personality(kind,ms){const b=ensureBubble();b.textContent=messages[kind]||messages.ready;b.className='g2-ai-hologram g2-ai-holo-'+kind;b.classList.add('show');clearTimeout(bubbleTimer);if(ms)bubbleTimer=setTimeout(()=>b.classList.remove('show'),ms)}
  function state(name,ms){body.classList.remove('g2-ai-think','g2-ai-happy','g2-ai-alert','g2-ai-mission','g2-ai-complete','g2-ai-encourage','g2-ai-mastery');body.classList.add('g2-ai-'+name);personality(name,ms||0);if(ms)setTimeout(()=>body.classList.remove('g2-ai-'+name),ms)}
  function celebration(){if(reduce)return;for(let i=0;i<18;i++){const s=document.createElement('i');s.className='g2-celebration-spark';s.style.left=(50+(Math.random()-.5)*12)+'vw';s.style.top=(28+(Math.random()-.5)*12)+'vh';s.style.setProperty('--sx',((Math.random()-.5)*260)+'px');s.style.setProperty('--sy',((Math.random()-.65)*220)+'px');s.style.setProperty('--delay',(Math.random()*.18)+'s');body.appendChild(s);setTimeout(()=>s.remove(),1050)}const burst=document.createElement('div');burst.className='g2-completion-burst';body.appendChild(burst);setTimeout(()=>burst.remove(),1100)}
  function launch(el){const target=el.closest('.world,[data-m]')||el;if(!target)return;const r=target.getBoundingClientRect(),fx=document.createElement('div');fx.className='g2-mission-launch';fx.style.left=(r.left+r.width/2)+'px';fx.style.top=(r.top+r.height/2)+'px';body.appendChild(fx);setTimeout(()=>fx.remove(),800);state('mission',850)}
  let lastDoneCount=(currentState()||{}).done?.length||0;
  function detectCompletion(){const s=currentState(),count=Array.isArray(s?.done)?new Set(s.done).size:0;if(count>lastDoneCount){const mission=Number(s?.current)||0;const m=writeMemory({completed:(readMemory()?.completed||0)+(count-lastDoneCount),lastOutcome:'complete',lastMission:mission});lastDoneCount=count;state('complete',1400);celebration();if(m&&m.completed>=3)state('mastery',1800)}}
  setInterval(detectCompletion,350);
  document.addEventListener('click',e=>{const el=e.target.closest('button,a');if(!el)return;
    if(el.matches('.world,[data-m]'))launch(el);
    if(el.matches('.choice[data-answer="right"]')){const m=writeMemory({correct:(readMemory()?.correct||0)+1,lastOutcome:'correct'});state(m&&m.correct>=5?'mastery':'happy',m&&m.correct>=5?1500:1200)}
    if(el.matches('.choice[data-answer="wrong"]')){writeMemory({wrong:(readMemory()?.wrong||0)+1,lastOutcome:'wrong'});state('alert',1000)}
    if(el.hasAttribute('data-save-answer')){writeMemory({correct:(readMemory()?.correct||0)+1,lastOutcome:'written'});state('happy',1000)}
  });
  document.addEventListener('focusin',e=>{if(e.target.matches('textarea,input'))state('think',0)});
  document.addEventListener('focusout',e=>{if(e.target.matches('textarea,input')){body.classList.remove('g2-ai-think');personality('ready',900)}});
  addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('.choice')){writeMemory({correct:(readMemory()?.correct||0)+1,lastOutcome:'correct'});state('happy',900)}});
  if(reduce){personality('ready',1200);return}
  let robot=null,lastSpark=0,phase=Math.random()*10;const sparks=[];
  function queryRobot(){const next=document.querySelector('body[data-grade="2"] .hero .robot');if(next!==robot){robot=next;if(robot)robot.style.translate='0 0'}return robot}
  function spark(){if(!robot||sparks.length>=18)return;const r=robot.getBoundingClientRect(),s=document.createElement('i');s.className='g2-xenon-spark';s.style.left=(r.left+r.width*.5+(Math.random()-.5)*18)+'px';s.style.top=(r.top+r.height*.72+(Math.random()-.5)*12)+'px';s.style.setProperty('--sx',((Math.random()-.5)*28)+'px');s.style.setProperty('--sy',(8+Math.random()*26)+'px');body.appendChild(s);sparks.push(s);setTimeout(()=>{s.remove();const i=sparks.indexOf(s);if(i>=0)sparks.splice(i,1)},900)}
  let last=performance.now();function flight(now){const dt=Math.min(32,now-last);last=now;const r=queryRobot();if(r){phase+=dt*.00035;const dx0=Math.sin(phase*.83)*13+Math.sin(phase*1.71)*5,dy0=Math.cos(phase*.67)*10+Math.sin(phase*1.43)*4;let dx=dx0,dy=dy0;if(fine){const b=r.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2,vx=cx-cursorX,vy=cy-cursorY,d=Math.hypot(vx,vy);if(d<210&&d>1){const f=(210-d)/210;dx+=(vx/d)*f*22;dy+=(vy/d)*f*22}}r.style.translate=Math.max(-34,Math.min(34,dx)).toFixed(2)+'px '+Math.max(-28,Math.min(28,dy)).toFixed(2)+'px';if(now-lastSpark>78){lastSpark=now;spark()}}requestAnimationFrame(flight)}requestAnimationFrame(flight);
  const mem=readMemory();if(mem){if(mem.lastOutcome==='wrong')personality('encourage',1700);else if(mem.completed>=3)personality('mastery',1700);else if(mem.lastOutcome==='correct')personality('happy',1300);else personality('ready',1300)}else personality('ready',1600);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
