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
    let resp = await window.EWM_AUTH.profile(db, session.user.id);
    if (!resp.data) {
      // Only the signed-in user's own missing row can be initialized, subject to RLS.
      // ignoreDuplicates prevents overwriting pre-existing admin/teacher profiles.
      const fallbackName = String(session.user.user_metadata?.full_name || 'მოსწავლე').slice(0,80);
      const attempt = await db.from('profiles').upsert({
        user_id: session.user.id, full_name: fallbackName, role: 'student', grade: 1
      }, {onConflict:'user_id',ignoreDuplicates:true});
      if(!attempt.error) resp = await window.EWM_AUTH.profile(db,session.user.id);
    }
    if (resp.error || !resp.data) {
      show('მოსწავლის პროფილი ვერ დადასტურდა. შეამოწმე ანგარიში და ინტერნეტკავშირი.', {href:'academy.html',label:'აკადემიაში დაბრუნება'});
      return;
    }
    // All authenticated learners can choose any of 12 grades. This is a UI gate,
    // NOT the server-side authorization boundary. Supabase RLS must protect data.
    const role = String(resp.data.role || '').trim().toLowerCase();
    const allowed = ['admin', 'parent', 'student'].includes(role);
    if (!allowed) {
      show('ამ ანგარიშს აკადემიაზე წვდომა არ აქვს.', {href:'academy.html',label:'დაბრუნება'});
      return;
    }
    window.MARIAMI_PREMIUM_AUTH = Object.freeze({authorized:true,role,assignedGrade:null});
    const protectedScripts = [...document.querySelectorAll('script[data-mariami-protected-src]')];
    if (protectedScripts.length !== 4) throw new Error('სასწავლო მოდულების სია არასრულია.');
    show('შესვლა დადასტურებულია — გაკვეთილები იტვირთება…');
    // All course scripts run only after session + profile have been verified.
    for (const item of protectedScripts) await load(item.getAttribute('data-mariami-protected-src'));
    // After the session and profile have been validated, initialize account-scoped avatars.
    // This flag controls UI presentation only; public teacher artwork is not access-restricted.
    // Magic Me V10: restore a pending avatar only for this verified account.
    let ownerVerified = false;
    try {
      await load('shared/magic-me-v10-pending.js?v=20261030');
      // Revalidate identity with the auth server; do not trust a locally cached session alone.
      const verified = await db.auth.getUser();
      const verifiedUser = verified && verified.data && verified.data.user;
      ownerVerified = !verified.error && verifiedUser?.id === session.user.id && verifiedUser?.app_metadata?.mariami_admin === true && String(verifiedUser?.email || '').trim().toLowerCase() === 'datogringo@gmail.com';
      if (!verified.error && verifiedUser && verifiedUser.id === session.user.id && window.EWM_MAGIC_V10_PENDING) {
        await window.EWM_MAGIC_V10_PENDING.restore(verifiedUser);
      }
    } catch (pendingError) {
      console.warn('[Magic Me] Pending avatar restore skipped:', pendingError);
    }
    window.MARIAMI_MAGIC_ME_CONTEXT = Object.freeze({
      userId: session.user.id,
      isOwner: role === 'admin' && ownerVerified
    });
    try { await load('shared/magic-me.js?v=20261027-v1'); }
    catch (avatarError) { console.warn('[Magic Me] Optional avatar unavailable:', avatarError); }
    try { await load('shared/magic-me-v10-academy.js?v=20261028'); } catch (err) { console.warn('[Magic Me V10] Optional portrait unavailable:', err); }
    ROOT.classList.add('mariami-auth-ready');
    gate.remove();
  }
  main().catch(error => {
    console.error('[Mariami PREMIUM auth]', error);
    show('ავტორიზაციის ან გვერდის ჩატვირთვის შეცდომა. გაკვეთილები არ გაიხსნა.', {href:'academy.html',label:'აკადემიაში დაბრუნება'});
  });
})();
