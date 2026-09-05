/* Grade 4 — runtime hardening.
   Supabase is the only runtime source of lessons.
   The local curriculum is intentionally disabled as a silent fallback so a
   backend failure can never masquerade as a smaller/older curriculum.
*/
(function(){
  'use strict';

  const EXPECTED_LESSONS = 60;
  const BOOT_TIMEOUT_MS = 10000;
  const fallback = window.GRADE4_FUTURISTIC_CONTENT;

  if (fallback && Array.isArray(fallback.lessons)) {
    fallback.lessons = [];
  }

  window.__G4_RUNTIME_SOURCE = 'pending';
  window.__G4_RUNTIME_HARDENING = {
    expected: EXPECTED_LESSONS,
    source: 'pending',
    error: null
  };

  /* MASTER QA: grade4.js calls academy_record_activity without p_max_score.
     The canonical RPC requires it. Normalize the legacy frontend payload here
     before the call reaches Supabase, without changing other RPC calls. */
  const db = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
  if (db && typeof db.rpc === 'function' && !db.__g4RewardRpcHardened) {
    const originalRpc = db.rpc.bind(db);
    db.rpc = function(fn, args, options){
      if (fn === 'academy_record_activity' && args && typeof args === 'object') {
        const next = Object.assign({}, args);
        if (Number(next.p_grade) === 4 && next.p_max_score == null) next.p_max_score = 100;
        return originalRpc(fn, next, options);
      }
      return originalRpc(fn, args, options);
    };
    db.__g4RewardRpcHardened = true;
  }

  function showError(reason) {
    const detail = reason ? String(reason) : 'Supabase did not return the required 60 Grade 4 lessons.';
    window.__G4_RUNTIME_SOURCE = 'error';
    window.__G4_RUNTIME_HARDENING.source = 'error';
    window.__G4_RUNTIME_HARDENING.error = detail;

    const stats = document.querySelector('#liveStats');
    if (stats) stats.textContent = '⛔ GRADE 4 OFFLINE • 60 LESSONS REQUIRED • SUPABASE CONNECTION FAILED';

    const progress = document.querySelector('#progressText');
    if (progress) progress.textContent = '—';
    const bar = document.querySelector('#progressBar');
    if (bar) bar.style.width = '0%';
    const next = document.querySelector('#nextMission');
    if (next) next.textContent = 'Reconnect required — no fallback curriculum is available.';

    const root = document.querySelector('#missions');
    if (root) {
      root.innerHTML = `<article class="mission g4-runtime-error" role="alert">
        <span class="num">SYSTEM ERROR • GRADE 4 CORE OFFLINE</span>
        <span class="icon">⛔</span>
        <h3>Grade 4 learning core could not connect.</h3>
        <p>We could not load the required 60 live lessons from Supabase. No fallback lessons were shown, so progress cannot be reported falsely.</p>
        <p class="g4-runtime-error-detail">${escapeHtml(detail)}</p>
        <button type="button" class="g4-runtime-reconnect">↻ RECONNECT &amp; RETRY</button>
      </article>`;
      const retry = root.querySelector('.g4-runtime-reconnect');
      if (retry) retry.addEventListener('click', function(){ window.location.reload(); });
    }

    document.body.classList.add('g4-runtime-offline');
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>\"']/g, function(m){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'})[m];
    });
  }

  function inspect(){
    const stats = document.querySelector('#liveStats');
    if (!stats) return;
    const text = stats.textContent || '';
    const match = text.match(/⚡\s*(\d+)\s+LESSONS/i);
    if (!match) return;
    const count = Number(match[1]);
    if (count === EXPECTED_LESSONS) {
      window.__G4_RUNTIME_SOURCE = 'supabase';
      window.__G4_RUNTIME_HARDENING.source = 'supabase';
      window.__G4_RUNTIME_HARDENING.error = null;
      document.body.classList.remove('g4-runtime-offline');
      return;
    }
    showError(`Runtime returned ${count} lessons; exactly ${EXPECTED_LESSONS} are required.`);
  }

  const stats = document.querySelector('#liveStats');
  if (stats) {
    new MutationObserver(inspect).observe(stats, {childList:true, characterData:true, subtree:true});
  }

  const review = document.querySelector('#review');
  if (review) {
    review.addEventListener('click', function(event){
      if (window.__G4_RUNTIME_SOURCE !== 'supabase') {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (window.__G4_RUNTIME_SOURCE === 'error') showError(window.__G4_RUNTIME_HARDENING.error);
      }
    }, true);
  }

  setTimeout(function(){
    if (window.__G4_RUNTIME_SOURCE === 'pending') {
      showError('Supabase response timed out while loading the Grade 4 curriculum.');
    }
  }, BOOT_TIMEOUT_MS);
})();