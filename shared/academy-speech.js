/* User-gesture speech for lesson words and Study Pro. No network requests. */
(() => {
  'use strict';
  const synth = window.speechSynthesis;
  const supported = !!(synth && window.SpeechSynthesisUtterance);
  let voices = [], active = null, serial = 0, startTimer = 0, activeReport = null;
  const browserHelp = 'ხმა ვერ ჩაირთო. სცადე Chrome ან Safari. Messenger-ში მენიუდან აირჩიე „ბრაუზერში გახსნა“.';
  function refreshVoices() { try { voices = synth?.getVoices() || []; } catch { voices = []; } }
  function stop() {
    serial++; clearTimeout(startTimer); startTimer = 0; active = null;
    if (activeReport) activeReport(''); activeReport = null;
    if (supported) try { synth.cancel(); } catch {}
  }
  function speak(text, options = {}) {
    const report = message => { if (typeof options.onStatus === 'function') options.onStatus(message); };
    const value = String(text || '').trim();
    if (!value) return false;
    if (!supported) { report(browserHelp); return false; }
    // Keep activation in the button's click/tap stack; do not await voices or timers.
    if (active || synth.speaking || synth.pending) stop();
    else { serial++; clearTimeout(startTimer); }
    const token = serial;
    refreshVoices();
    try {
      const utterance = new SpeechSynthesisUtterance(value);
      const exact = voice => /^en[-_]gb$/i.test(voice.lang || '');
      const english = voice => /^en(?:[-_]|$)/i.test(voice.lang || '');
      const voice = voices.find(v => exact(v) && v.localService) || voices.find(exact) || voices.find(v => english(v) && v.localService) || voices.find(english);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || 'en-GB';
      utterance.rate = Math.max(0.5, Math.min(1.2, Number(options.rate) || 0.9));
      utterance.volume = 1; utterance.pitch = 1;
      // A strong reference prevents mobile engines from losing queued utterances.
      active = utterance; activeReport = report;
      utterance.onstart = () => { if (token !== serial) return; clearTimeout(startTimer); report(''); };
      utterance.onend = () => { if (token !== serial) return; clearTimeout(startTimer); active = null; activeReport = null; report(''); };
      utterance.onerror = event => {
        if (token !== serial) return;
        clearTimeout(startTimer); active = null; activeReport = null;
        if (['canceled','interrupted'].includes(event.error)) return;
        report(event.error === 'language-unavailable' || event.error === 'voice-unavailable' ? 'ტელეფონის მეტყველების პარამეტრებში დაამატე ინგლისური ხმა და თავიდან სცადე.' : browserHelp);
      };
      // Resume synchronously: Android/WebView can retain a paused synthesis queue.
      synth.resume();
      startTimer = setTimeout(() => {
        if (token !== serial || active !== utterance) return;
        stop(); report(browserHelp);
      }, 6000);
      report('ხმა იტვირთება…');
      synth.speak(utterance);
      return true;
    } catch {
      stop(); report(browserHelp); return false;
    }
  }
  refreshVoices();
  if (supported && typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refreshVoices);
  addEventListener('pagehide', stop);
  window.EWM_SPEECH = Object.freeze({ speak, stop, supported });
})();
