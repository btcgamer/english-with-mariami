/* English with Mariami — additive PREMIUM route session guard.
 * IMPORTANT: GitHub Pages assets are public. This is a UI/session gate,
 * not a security boundary for public curriculum files or localStorage data.
 * Does not write to Supabase or alter learner progress.
 */
(() => {
  'use strict';
  const ROOT = document.documentElement;
  const gate = document.createElement('section');
  gate.id = 'mariami-auth-status';
  gate.setAttribute('role', 'status');
  gate.setAttribute('aria-live', 'polite');
  gate.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#08152b;color:#f0f6ff;display:grid;place-items:center;padding:24px;font:16px/1.6 system-ui,sans-serif;text-align:center';
  const message = document.createElement('div');
  message.style.cssText = 'max-width:480px';
  gate.append(message);
  document.body.append(gate);
  function show(value, link) {
    message.replaceChildren();
    const p = document.createElement('p'); p.textContent = value; message.append(p);
    if (link) {
      const a = document.createElement('a'); a.href = link.href;
      a.textContent = link.label;
      a.style.cssText = 'color:#58e7ff;text-decoration:underline;display:inline-block;padding:10px';
      message.append(a);
    }
  }
  const local = location.protocol === 'file:';
  const current = location.pathname.split('/').pop() + location.search + location.hash;
  const loginUrl = 'login.html?redirect=' + encodeURIComponent(current);
  show('მიმდინარეობს მოსწავლის სესიის შემოწმება…');
  if (local) {
    show('ამ გვერდის ავტორიზაცია file:// რეჟიმში არ მოწმდება. გამოსაცდელად გამოიყენე ადგილობრივი HTTP სერვერი ან გამოქვეყნებული საიტი.');
    return;
  }
  const client = () => window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient || null;
  function load(path) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = path; s.async = false;
      s.onload = resolve;
      s.onerror = () => reject(new Error('ფაილი ვერ ჩაიტვირთა: ' + path));
      document.head.append(s);
    });
  }
  async function main() {
    if (!window.EWM_AUTH || typeof window.EWM_AUTH.waitForSession !== 'function') {
      throw new Error('არსებული ავტორიზაციის ფუნქცია მიუწვდომელია (config.js).');
    }
    const result = await window.EWM_AUTH.waitForSession(8000);
    let db = result.client || client();
    let session = result.session || null;
    if (!db || !session || !session.user) {
      show('გთხოვ, ჯერ შეხვიდე შენს ანგარიშში.', {href: loginUrl, label:'შესვლა'});
      return;
    }
    if (typeof window.EWM_AUTH.profile !== 'function') {
      throw new Error('მომხმარებლის პროფილის შემოწმების ფუნქცია მიუწვდომელია.');
    }
    const resp = await window.EWM_AUTH.profile(db, session.user.id);
    if (resp.error || !resp.data) {
      show('მოსწავლის პროფილი ვერ დადასტურდა. შეამოწმე ანგარიში და ინტერნეტკავშირი.', {href:'academy.html',label:'აკადემიაში დაბრუნება'});
      return;
    }
    const role = String(resp.data.role || '').trim().toLowerCase();
    const privileged = ['admin', 'teacher', 'parent', 'student'].includes(role);
    if (!privileged && role !== 'student') {
      show('ამ ანგარიშს PREMIUM ბიბლიოთეკაზე წვდომა არ აქვს.', {href:'academy.html',label:'აკადემიაში დაბრუნება'});
      return;
    }
    const assigned = Number(resp.data.grade);
    if (!privileged && (!Number.isInteger(assigned) || assigned < 1 || assigned > 12)) {
      show('მოსწავლის პროფილში კლასი ჯერ არ არის მითითებული.', {href:'academy.html',label:'აკადემიაში დაბრუნება'});
      return;
    }
    // The existing grade routing permits learners only their assigned grade.
    // Normalize the requested class BEFORE the course loader executes.
    if (!privileged) {
      const url = new URL(location.href);
      const requested = Number(url.searchParams.get('grade'));
      if (requested !== assigned) url.searchParams.delete('lesson');
      url.searchParams.set('grade', String(assigned));
      history.replaceState(null, '', url);
      document.addEventListener('change', event => {
        if (event.target && event.target.id === 'grade' && Number(event.target.value) !== assigned) {
          event.target.value = String(assigned);
          event.stopImmediatePropagation();
          event.preventDefault();
        }
      }, true);
    }
    window.MARIAMI_PREMIUM_AUTH = Object.freeze({authorized:true,role,assignedGrade:privileged?null:assigned});
    const protectedScripts = [...document.querySelectorAll('script[data-mariami-protected-src]')];
    if (protectedScripts.length !== 4) throw new Error('სასწავლო მოდულების სია არასრულია.');
    show('შესვლა დადასტურებულია — გაკვეთილები იტვირთება…');
    // All course scripts run only after session + profile have been verified.
    for (const item of protectedScripts) await load(item.getAttribute('data-mariami-protected-src'));
    if (!privileged) {
      const gradeSelect = document.getElementById('grade');
      if (gradeSelect) {
        for (const option of [...gradeSelect.options]) if (Number(option.value) !== assigned) option.remove();
        gradeSelect.value = String(assigned);
        gradeSelect.disabled = true;
        gradeSelect.title = 'მოსწავლეს მხოლოდ საკუთარ კლასზე აქვს წვდომა';
      }
    }
    // After the session and profile have been validated, initialize account-scoped avatars.
    // This flag controls UI presentation only; public teacher artwork is not access-restricted.
    window.MARIAMI_MAGIC_ME_CONTEXT = Object.freeze({
      userId: session.user.id,
      isOwner: String(session.user.email || '').trim().toLowerCase() === 'datogringo@gmail.com'
    });
    try { await load('shared/magic-me.js?v=20261027-v1'); }
    catch (avatarError) { console.warn('[Magic Me] Optional avatar unavailable:', avatarError); }
    ROOT.classList.add('mariami-auth-ready');
    gate.remove();
  }
  main().catch(error => {
    console.error('[Mariami PREMIUM auth]', error);
    show('ავტორიზაციის ან გვერდის ჩატვირთვის შეცდომა. გაკვეთილები არ გაიხსნა.', {href:'academy.html',label:'აკადემიაში დაბრუნება'});
  });
})();
