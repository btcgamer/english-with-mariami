(()=>{
  'use strict';
  if(window.__ewmAcademyWorld8)return; window.__ewmAcademyWorld8=1;
  const $=s=>document.querySelector(s);
  const grade=()=>{const m=location.pathname.match(/grade\s*([234])/i); if(m)return m[1]; const el=document.querySelector('[data-grade]'); return el?.dataset.grade||''};
  const g=grade();
  const palette=g==='4'?['#ffd76a','#b36bff','#fff1b0']:g==='3'?['#65f7ff','#a66cff','#d9c7ff']:['#5de8ff','#6f7dff','#c6f6ff'];
  const style=document.createElement('style');
  style.textContent=`
    body.ewm-world8{overflow-x:hidden;background:#02030b!important}
    .w8-scene{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;perspective:1100px;opacity:.95}
    .w8-nebula{position:absolute;inset:-20%;background:radial-gradient(circle at 18% 28%,${palette[1]}22,transparent 28%),radial-gradient(circle at 82% 22%,${palette[0]}18,transparent 25%),radial-gradient(circle at 50% 85%,${palette[2]}12,transparent 30%);filter:blur(18px);animation:w8Neb 18s ease-in-out infinite alternate}
    .w8-stars{position:absolute;inset:0;background-image:radial-gradient(circle,${palette[2]}cc 0 1px,transparent 1.5px),radial-gradient(circle,${palette[0]}99 0 1px,transparent 1.5px);background-size:97px 113px,173px 149px;background-position:0 0,42px 27px;animation:w8Stars 28s linear infinite}
    .w8-planet{position:absolute;width:clamp(90px,13vw,190px);aspect-ratio:1;border-radius:50%;right:7%;top:15%;background:radial-gradient(circle at 32% 28%,#fff8,${palette[0]}55 10%,${palette[1]}55 40%,#050515 72%);box-shadow:0 0 45px ${palette[0]}55,0 0 100px ${palette[1]}22;transform-style:preserve-3d;animation:w8Planet 14s ease-in-out infinite}
    .w8-planet:before{content:"";position:absolute;inset:35% -35%;border:1px solid ${palette[0]}66;border-radius:50%;transform:rotate(-18deg);box-shadow:0 0 18px ${palette[0]}33}
    .w8-crystal{position:absolute;width:18px;height:52px;clip-path:polygon(50% 0,100% 24%,76% 100%,24% 100%,0 24%);background:linear-gradient(135deg,#fff,${palette[0]},${palette[1]});filter:drop-shadow(0 0 14px ${palette[0]});animation:w8Float 7s ease-in-out infinite}
    .w8-c1{left:12%;top:30%;animation-delay:-2s}.w8-c2{left:28%;top:72%;transform:scale(.7);animation-delay:-4s}.w8-c3{right:22%;bottom:16%;transform:scale(1.3);animation-delay:-1s}.w8-c4{right:39%;top:12%;transform:scale(.55);animation-delay:-5s}
    .w8-horizon{position:absolute;left:-10%;right:-10%;bottom:-8%;height:35%;background:radial-gradient(ellipse at center,${palette[1]}1a,transparent 60%);border-top:1px solid ${palette[0]}18;transform:rotateX(58deg);transform-origin:bottom;box-shadow:0 -20px 80px ${palette[1]}12}
    .w8-content{position:relative;z-index:2}
    @keyframes w8Stars{to{background-position:97px 113px,-131px 122px}}@keyframes w8Neb{to{transform:scale(1.08) translate3d(2%,-2%,0)}}@keyframes w8Planet{0%,100%{transform:translate3d(0,0,40px) rotate(0)}50%{transform:translate3d(-22px,18px,90px) rotate(9deg)}}@keyframes w8Float{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-24px) rotate(8deg)}}
    @media(max-width:700px){.w8-planet{right:-30px;top:12%;opacity:.65}.w8-crystal{opacity:.55}.w8-nebula{filter:blur(12px)}}
    @media(prefers-reduced-motion:reduce){.w8-stars,.w8-nebula,.w8-planet,.w8-crystal{animation:none}.w8-content{transform:none!important}}
  `;
  document.head.appendChild(style);
  document.body.classList.add('ewm-world8');
  const scene=document.createElement('div'); scene.className='w8-scene';
  scene.innerHTML='<div class="w8-nebula"></div><div class="w8-stars"></div><div class="w8-planet"></div><div class="w8-crystal w8-c1"></div><div class="w8-crystal w8-c2"></div><div class="w8-crystal w8-c3"></div><div class="w8-crystal w8-c4"></div><div class="w8-horizon"></div>';
  document.body.prepend(scene);
  const content=document.querySelector('main')||document.querySelector('.main')||document.body;
  content.classList.add('w8-content');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let tx=0,ty=0;
  window.addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*10;ty=(e.clientY/innerHeight-.5)*6;scene.style.transform=`translate3d(${tx}px,${ty}px,0)`},{passive:true});
})();
