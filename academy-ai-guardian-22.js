/* AI Guardian Smart Feedback 22.0
 * Visual-only feedback layer. Does not modify gameplay state, auth, Supabase,
 * XP, stars, progress, lessons, or navigation.
 */
(function () {
  'use strict';
  if (window.__EWM_GUARDIAN_22__) return;
  window.__EWM_GUARDIAN_22__ = true;

  var grade = (document.body && document.body.dataset && document.body.dataset.grade) || '';
  var root = document.documentElement;

  function palette() {
    if (grade === '4') return { accent: '#ffd45a', accent2: '#b66cff', label: 'G4' };
    if (grade === '3') return { accent: '#5df2ff', accent2: '#a66cff', label: 'G3' };
    return { accent: '#5df2ff', accent2: '#4d7cff', label: 'G2' };
  }

  var p = palette();
  root.dataset.guardianFeedback22 = 'online';

  function ensureStyles() {
    if (document.getElementById('ewm-g22-style')) return;
    var s = document.createElement('style');
    s.id = 'ewm-g22-style';
    s.textContent = `
      #ewm-g22-feedback{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);z-index:999998;min-width:220px;max-width:min(88vw,420px);padding:11px 18px;border:1px solid rgba(93,242,255,.42);border-radius:999px;background:linear-gradient(135deg,rgba(7,14,34,.94),rgba(18,10,42,.9));box-shadow:0 0 22px rgba(93,242,255,.2),inset 0 0 20px rgba(166,108,255,.08);backdrop-filter:blur(12px);color:#fff;text-align:center;font:800 12px/1.2 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;opacity:0;pointer-events:none;transition:opacity .22s ease,transform .22s ease,box-shadow .22s ease;border-color:rgba(93,242,255,.42)}
      #ewm-g22-feedback.show{opacity:1;transform:translate(-50%,0)}
      #ewm-g22-feedback.correct{border-color:${p.accent};box-shadow:0 0 28px rgba(93,242,255,.38),inset 0 0 24px rgba(93,242,255,.1)}
      #ewm-g22-feedback.retry{border-color:#ff719f;box-shadow:0 0 28px rgba(255,113,159,.28),inset 0 0 24px rgba(255,113,159,.08)}
      #ewm-g22-feedback.complete{border-color:${p.accent};box-shadow:0 0 34px rgba(255,212,90,.35),inset 0 0 28px rgba(255,212,90,.1)}
      body.g22-correct .g7-core{filter:brightness(1.55) saturate(1.25);transform:scale(1.08)}
      body.g22-correct .g7-eye{filter:brightness(1.8)}
      body.g22-retry .g7-core{filter:brightness(1.12) saturate(.9)}
      body.g22-retry .g7-eye{filter:hue-rotate(320deg) brightness(1.35)}
      body.g22-complete .g7-core{filter:brightness(1.8) saturate(1.35);transform:scale(1.12)}
      body.g22-complete .g7-ring{filter:brightness(1.6)}
      @media (max-width:600px){#ewm-g22-feedback{bottom:14px;min-width:190px;padding:10px 14px;font-size:10px}}
      @media (prefers-reduced-motion:reduce){#ewm-g22-feedback{transition:none}}
    `;
    document.head.appendChild(s);
  }

  function ensurePanel() {
    if (document.getElementById('ewm-g22-feedback')) return document.getElementById('ewm-g22-feedback');
    var el = document.createElement('div');
    el.id = 'ewm-g22-feedback';
    el.setAttribute('aria-live', 'polite');
    el.textContent = 'GUARDIAN FEEDBACK • READY';
    document.body.appendChild(el);
    return el;
  }

  var timer = 0;
  function show(kind, text) {
    if (!document.body) return;
    ensureStyles();
    var el = ensurePanel();
    document.body.classList.remove('g22-correct', 'g22-retry', 'g22-complete');
    el.className = '';
    el.classList.add('show', kind);
    el.textContent = text;
    clearTimeout(timer);
    timer = setTimeout(function () {
      el.classList.remove('show');
      document.body.classList.remove('g22-correct', 'g22-retry', 'g22-complete');
    }, kind === 'complete' ? 2200 : 1500);
    document.body.classList.add('g22-' + kind);
  }

  function answerResult(target) {
    var node = target && target.closest ? target.closest('.choice,[data-answer],[data-correct]') : null;
    if (!node) return null;
    var a = String(node.dataset.answer || '').toLowerCase();
    var c = String(node.dataset.correct || '').toLowerCase();
    if (a === 'right' || a === 'correct' || a === 'true' || c === 'true' || node.classList.contains('correct')) return 'correct';
    if (a || c || node.classList.contains('wrong') || node.classList.contains('incorrect')) return 'retry';
    return null;
  }

  function onClick(e) {
    var result = answerResult(e.target);
    if (result === 'correct') show('correct', 'CORRECT • GREAT JOB');
    else if (result === 'retry') show('retry', 'TRY AGAIN • KEEP GOING');
  }

  function onComplete() {
    show('complete', 'MISSION MASTERED • GREAT JOB');
  }

  function boot() {
    if (!document.body) return;
    ensureStyles();
    document.addEventListener('click', onClick, true);
    document.addEventListener('ewm:mission-complete', onComplete);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
