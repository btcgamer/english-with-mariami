(() => {
  'use strict';

  /* MAGIC NEON AI ACADEMY — Academy Portal 4.0
     Visual-only layer. Does not alter auth, progress, XP, stars, or navigation. */
  if (!/\/academy\.html$/i.test(window.location.pathname)) return;

  const boot = () => {
    if (document.documentElement.dataset.academyPortal4 === '1') return;
    document.documentElement.dataset.academyPortal4 = '1';

    const style = document.createElement('style');
    style.id = 'academy-portal-4-style';
    style.textContent = `
      .ap4-portal{position:relative;isolation:isolate;transform-style:preserve-3d;overflow:hidden}
      .ap4-portal::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:conic-gradient(from 0deg,rgba(0,234,255,.05),rgba(0,234,255,.85),rgba(139,92,255,.8),rgba(255,54,217,.55),rgba(0,234,255,.05));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:ap4Spin 7s linear infinite;pointer-events:none;z-index:3}
      .ap4-portal::after{content:"";position:absolute;inset:8px;border-radius:inherit;border:1px solid rgba(0,234,255,.16);box-shadow:inset 0 0 35px rgba(0,234,255,.08);pointer-events:none;z-index:2}
      .ap4-energy{position:absolute;right:18px;top:18px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(0,234,255,.55);background:radial-gradient(circle,rgba(0,234,255,.42),rgba(139,92,255,.14) 42%,transparent 70%);box-shadow:0 0 22px rgba(0,234,255,.32);pointer-events:none;z-index:4;animation:ap4Pulse 2.6s ease-in-out infinite}
      .ap4-energy::before,.ap4-energy::after{content:"";position:absolute;inset:-7px;border-radius:50%;border:1px solid rgba(0,234,255,.18);animation:ap4Ring 2.8s ease-out infinite}
      .ap4-energy::after{inset:-14px;animation-delay:1.2s;opacity:.55}
      .ap4-enter{position:absolute;right:14px;bottom:14px;z-index:5;padding:7px 10px;border:1px solid rgba(0,234,255,.35);border-radius:10px;background:rgba(0,14,30,.72);color:#dffbff;font:900 9px/1 Arial,sans-serif;letter-spacing:.08em;opacity:.72;transform:translateY(5px);transition:.3s;pointer-events:none;text-shadow:0 0 9px #00eaff}
      .ap4-portal:hover{transform:translateY(-6px) scale(1.012);box-shadow:0 20px 55px rgba(0,0,0,.5),0 0 45px rgba(0,234,255,.18)}
      .ap4-portal:hover .ap4-enter{opacity:1;transform:translateY(0)}
      .ap4-portal:hover .ap4-energy{box-shadow:0 0 32px rgba(0,234,255,.58)}
      .ap4-launch{animation:ap4Launch .85s ease both}
      @keyframes ap4Spin{to{transform:rotate(360deg)}}
      @keyframes ap4Pulse{50%{transform:scale(1.12);filter:brightness(1.25)}}
      @keyframes ap4Ring{0%{transform:scale(.55);opacity:.8}100%{transform:scale(1.45);opacity:0}}
      @keyframes ap4Launch{0%{filter:brightness(1)}35%{filter:brightness(1.8) saturate(1.4);transform:translateY(-8px) scale(1.025)}100%{filter:brightness(1);transform:none}}
      body.ap4-g3 .ap4-portal::before{background:conic-gradient(from 0deg,rgba(0,234,255,.05),rgba(0,234,255,.9),rgba(139,92,255,.85),rgba(0,234,255,.15),rgba(0,234,255,.05))}
      body.ap4-g3 .ap4-energy{border-color:rgba(139,92,255,.7);background:radial-gradient(circle,rgba(0,234,255,.28),rgba(139,92,255,.3) 45%,transparent 72%);box-shadow:0 0 24px rgba(139,92,255,.4)}
      body.ap4-g4 .ap4-portal::before{background:conic-gradient(from 0deg,rgba(255,230,0,.05),rgba(255,230,0,.95),rgba(139,92,255,.85),rgba(255,230,0,.2),rgba(255,230,0,.05))}
      body.ap4-g4 .ap4-energy{border-color:rgba(255,230,0,.75);background:radial-gradient(circle,rgba(255,230,0,.4),rgba(139,92,255,.2) 45%,transparent 72%);box-shadow:0 0 26px rgba(255,230,0,.42)}
      @media(max-width:650px){.ap4-energy{width:34px;height:34px;right:12px;top:12px}.ap4-enter{font-size:8px;right:10px;bottom:10px}.ap4-portal:hover{transform:translateY(-3px) scale(1.005)}}
      @media(prefers-reduced-motion:reduce){.ap4-portal::before,.ap4-energy,.ap4-energy::before,.ap4-energy::after{animation:none}.ap4-portal:hover{transform:none}}
    `;
    document.head.appendChild(style);

    const candidates = [...document.querySelectorAll('.grade-card,.grade-card-2,.grade-card-3,.grade-card-4,.grade2,.grade3,.grade4,[data-grade="2"],[data-grade="3"],[data-grade="4"]')];
    const cards = candidates.filter((el, i, arr) => arr.indexOf(el) === i);
    cards.forEach(card => {
      const text = (card.textContent || '').toLowerCase();
      const attr = card.getAttribute('data-grade');
      const grade = attr || (text.includes('grade 4') || text.includes('მე-4') ? '4' : text.includes('grade 3') || text.includes('მე-3') ? '3' : text.includes('grade 2') || text.includes('მე-2') ? '2' : '');
      if (!grade) return;
      card.classList.add('ap4-portal');
      card.dataset.ap4Grade = grade;
      if (grade === '3') document.body.classList.add('ap4-g3');
      if (grade === '4') document.body.classList.add('ap4-g4');
      if (!card.querySelector('.ap4-energy')) { const e=document.createElement('span'); e.className='ap4-energy'; e.setAttribute('aria-hidden','true'); card.appendChild(e); }
      if (!card.querySelector('.ap4-enter')) { const e=document.createElement('span'); e.className='ap4-enter'; e.textContent='ENTER WORLD →'; e.setAttribute('aria-hidden','true'); card.appendChild(e); }
      card.addEventListener('click', () => { card.classList.remove('ap4-launch'); void card.offsetWidth; card.classList.add('ap4-launch'); }, {passive:true});
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
