(() => {
  'use strict';

  /* MAGIC NEON AI ACADEMY — Academy Command Center 3.0
     Visual-only layer. Reads existing local progress state but never writes or changes it. */

  function cleanupOldAcademyOverlay() {
    const overlay = document.getElementById('academy-3d-overlay');
    if (overlay) overlay.remove();
    document.querySelectorAll('style').forEach((style) => {
      const css = style.textContent || '';
      if (css.includes('#academy-3d-overlay') && css.includes('.abc3d') && css.includes('@keyframes acfloat')) style.remove();
    });
  }

  function installCommandCenter() {
    if (document.getElementById('academy-command-center')) return;
    const style = document.createElement('style');
    style.id = 'academy-command-center-3-style';
    style.textContent = `
#academy-command-center{position:fixed;right:18px;bottom:18px;z-index:120;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(0,234,255,.34);border-radius:18px;background:linear-gradient(135deg,rgba(3,18,40,.88),rgba(5,7,25,.78));box-shadow:0 0 28px rgba(0,234,255,.16),inset 0 0 22px rgba(0,234,255,.05);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font:700 10px/1 Arial,sans-serif;letter-spacing:.08em;color:#dffbff;}
#academy-command-center .acc-core{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(0,234,255,.7);background:radial-gradient(circle,rgba(0,234,255,.32),rgba(139,92,255,.12) 45%,transparent 72%);box-shadow:0 0 18px rgba(0,234,255,.38);animation:accPulse 2.8s ease-in-out infinite;flex:0 0 auto}
#academy-command-center .acc-title{color:#fff;font-weight:1000;font-size:9px;margin-bottom:5px;text-shadow:0 0 10px #00eaff}
#academy-command-center .acc-metrics{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#academy-command-center .acc-metric{padding:5px 7px;border-radius:9px;border:1px solid rgba(0,234,255,.2);background:rgba(0,20,42,.55);white-space:nowrap}
#academy-command-center .acc-value{color:#ffe600;font-weight:1000}
#academy-command-center .acc-signal{width:6px;height:6px;border-radius:50%;background:#55ffb0;box-shadow:0 0 9px #55ffb0;display:inline-block;margin-right:5px}
@keyframes accPulse{50%{transform:scale(1.08);box-shadow:0 0 28px rgba(0,234,255,.52)}}
@media(max-width:650px){#academy-command-center{left:11px;right:11px;bottom:10px;padding:9px 10px;border-radius:15px}.acc-metrics{gap:5px}.acc-metric{padding:5px 6px;font-size:9px}.acc-core{width:30px!important;height:30px!important}}
@media(prefers-reduced-motion:reduce){#academy-command-center .acc-core{animation:none}}
`;
    document.head.appendChild(style);
    const panel = document.createElement('div');
    panel.id = 'academy-command-center';
    panel.setAttribute('aria-label','Academy Command Center');
    panel.innerHTML = '<div class="acc-core">⚡</div><div><div class="acc-title"><span class="acc-signal"></span>COMMAND CENTER • ONLINE</div><div class="acc-metrics"><span class="acc-metric">G2 <b class="acc-value" data-acc="2">0%</b></span><span class="acc-metric">G3 <b class="acc-value" data-acc="3">0%</b></span><span class="acc-metric">G4 <b class="acc-value" data-acc="4">0%</b></span><span class="acc-metric">⭐ <b class="acc-value" id="acc-stars">0</b></span></div></div>';
    document.body.appendChild(panel);

    const read = (grade) => {
      try { const s=JSON.parse(localStorage.getItem('magic-neon-grade-'+grade)||'null'); const done=Array.isArray(s&&s.done)?s.done.length:0; return Math.max(0,Math.min(100,Math.round(done/60*100))); }
      catch (_) { return 0; }
    };
    const refresh = () => {
      [2,3,4].forEach((g)=>{const el=panel.querySelector('[data-acc="'+g+'"]');if(el)el.textContent=read(g)+'%';});
      let stars=0; [2,3,4].forEach((g)=>{try{const s=JSON.parse(localStorage.getItem('magic-neon-grade-'+g)||'null');stars+=Number(s&&s.stars)||0;}catch(_){}});
      const el=panel.querySelector('#acc-stars'); if(el)el.textContent=stars;
    };
    refresh();
    window.addEventListener('storage',refresh,{passive:true});
    window.addEventListener('englishMariamiProgressUpdated',refresh,{passive:true});
  }

  if (/\/academy\.html$/i.test(window.location.pathname)) {
    const boot=()=>{cleanupOldAcademyOverlay();installCommandCenter();};
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  }
})();
