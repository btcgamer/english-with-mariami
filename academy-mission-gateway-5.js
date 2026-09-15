(() => {
  'use strict';
  if (document.documentElement.dataset.ewmMissionGateway5 === '1') return;
  document.documentElement.dataset.ewmMissionGateway5 = '1';

  const STYLE_ID = 'ewm-mission-gateway-5-style';
  const OVERLAY_ID = 'ewm-mission-gateway-5-overlay';

  function gradeOf(card) {
    const raw = card?.dataset?.grade || card?.getAttribute?.('data-grade') || '';
    const text = (card?.textContent || '').toLowerCase();
    if (String(raw).includes('4') || /grade\s*4|class\s*4|მეოთხე/.test(text)) return '4';
    if (String(raw).includes('3') || /grade\s*3|class\s*3|მესამე/.test(text)) return '3';
    return '2';
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ewm-g5-overlay{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 50%,rgba(72,224,255,.16),rgba(5,8,25,.88) 52%,rgba(1,2,10,.96));overflow:hidden}
      .ewm-g5-overlay.g5-show{animation:g5Fade .78s ease-out forwards}
      .ewm-g5-overlay.g5-g2{--g5a:#36e8ff;--g5b:#776cff}.ewm-g5-overlay.g5-g3{--g5a:#55f5ff;--g5b:#a46cff}.ewm-g5-overlay.g5-g4{--g5a:#ffd65a;--g5b:#a46cff}
      .ewm-g5-ring{position:absolute;width:min(58vw,430px);aspect-ratio:1;border:2px solid color-mix(in srgb,var(--g5a) 80%,transparent);border-radius:50%;box-shadow:0 0 25px var(--g5a),inset 0 0 30px color-mix(in srgb,var(--g5b) 65%,transparent);animation:g5Spin .9s cubic-bezier(.2,.8,.2,1) both}
      .ewm-g5-ring:before,.ewm-g5-ring:after{content:"";position:absolute;inset:9%;border:1px solid color-mix(in srgb,var(--g5b) 75%,transparent);border-radius:50%;animation:g5Spin 1.6s linear infinite reverse}
      .ewm-g5-ring:after{inset:28%;border-style:dashed;box-shadow:0 0 30px var(--g5a)}
      .ewm-g5-core{position:absolute;width:82px;height:82px;border-radius:50%;background:radial-gradient(circle,#fff 0 5%,var(--g5a) 20%,var(--g5b) 58%,transparent 72%);filter:drop-shadow(0 0 24px var(--g5a));animation:g5Core .72s ease-out both}
      .ewm-g5-panel{position:relative;z-index:2;width:min(86vw,540px);padding:24px 28px;border:1px solid color-mix(in srgb,var(--g5a) 65%,rgba(255,255,255,.15));border-radius:22px;background:linear-gradient(135deg,rgba(10,18,42,.78),rgba(12,8,35,.64));box-shadow:0 0 35px color-mix(in srgb,var(--g5a) 24%,transparent),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(14px);text-align:center;transform:translateY(14px) scale(.94);animation:g5Panel .62s .08s cubic-bezier(.2,.9,.2,1) forwards}
      .ewm-g5-kicker{font:700 10px/1.2 system-ui,sans-serif;letter-spacing:.28em;color:var(--g5a);text-transform:uppercase;text-shadow:0 0 12px var(--g5a)}
      .ewm-g5-title{margin:8px 0 4px;font:900 clamp(22px,5vw,38px)/1.05 system-ui,sans-serif;letter-spacing:.08em;color:#fff;text-shadow:0 0 18px var(--g5a)}
      .ewm-g5-status{font:700 11px/1.4 system-ui,sans-serif;letter-spacing:.18em;color:rgba(255,255,255,.72);text-transform:uppercase}
      .ewm-g5-scan{position:absolute;inset:0;background:linear-gradient(transparent 48%,color-mix(in srgb,var(--g5a) 22%,transparent) 50%,transparent 52%);background-size:100% 9px;mix-blend-mode:screen;opacity:.45;animation:g5Scan .7s linear both}
      @keyframes g5Fade{0%{opacity:0}12%,78%{opacity:1}100%{opacity:0}}
      @keyframes g5Spin{from{transform:rotate(0) scale(.72);opacity:.2}to{transform:rotate(360deg) scale(1);opacity:1}}
      @keyframes g5Core{from{transform:scale(.1);opacity:0}65%{transform:scale(1.25);opacity:1}to{transform:scale(1);opacity:1}}
      @keyframes g5Panel{to{transform:translateY(0) scale(1);opacity:1}}
      @keyframes g5Scan{from{transform:translateY(-55%)}to{transform:translateY(55%)}}
      .ewm-g5-card-launch{animation:g5Card .48s cubic-bezier(.2,.9,.2,1) both!important}
      @keyframes g5Card{45%{transform:translateY(-5px) scale(1.025)}100%{transform:translateY(0) scale(1)}}
      @media(max-width:600px){.ewm-g5-panel{padding:20px 18px;border-radius:18px}.ewm-g5-ring{width:76vw}.ewm-g5-core{width:62px;height:62px}}
      @media(prefers-reduced-motion:reduce){.ewm-g5-overlay.g5-show,.ewm-g5-ring,.ewm-g5-ring:before,.ewm-g5-ring:after,.ewm-g5-core,.ewm-g5-panel,.ewm-g5-scan,.ewm-g5-card-launch{animation:none!important}.ewm-g5-overlay.g5-show{opacity:1}.ewm-g5-panel{transform:none}}
    `;
    document.head.appendChild(style);
  }

  function getLabel(card, grade) {
    const explicit = card?.querySelector?.('[data-grade-name],.grade-title,.grade-name,h2,h3,h4');
    const value = explicit?.textContent?.trim();
    return value || `GRADE ${grade}`;
  }

  function launch(card) {
    if (!card || card.dataset.g5Busy === '1') return;
    card.dataset.g5Busy = '1';
    const grade = gradeOf(card);
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = `ewm-g5-overlay g5-g${grade}`;
    overlay.innerHTML = `<div class="ewm-g5-ring" aria-hidden="true"></div><div class="ewm-g5-core" aria-hidden="true"></div><div class="ewm-g5-panel"><div class="ewm-g5-kicker">MISSION GATEWAY • ONLINE</div><div class="ewm-g5-title">${getLabel(card, grade)}</div><div class="ewm-g5-status">Opening world gateway…</div></div><div class="ewm-g5-scan" aria-hidden="true"></div>`;
    document.body.appendChild(overlay);
    card.classList.add('ewm-g5-card-launch');
    requestAnimationFrame(() => overlay.classList.add('g5-show'));
    window.setTimeout(() => {
      overlay.remove();
      card.classList.remove('ewm-g5-card-launch');
      delete card.dataset.g5Busy;
    }, 850);
  }

  function findGradeCard(target) {
    const el = target?.closest?.('a,button,[role="button"],.grade-card,.grade-card-link,.grade-option,.card');
    if (!el) return null;
    const text = (el.textContent || '').toLowerCase();
    const hasGrade = el.dataset?.grade || /grade\s*[234]|class\s*[234]|მეორე|მესამე|მეოთხე/.test(text);
    if (!hasGrade) return null;
    return el;
  }

  function boot() {
    if (!document.body) return;
    injectStyle();
    document.addEventListener('pointerdown', event => {
      const card = findGradeCard(event.target);
      if (card) launch(card);
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
