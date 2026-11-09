/* A purchase token or local storage is never proof of paid access. */
(() => {
  'use strict';
  const status = document.getElementById('subscription-status');
  const signIn = document.getElementById('subscription-sign-in');
  const restore = document.getElementById('restore-purchases');
  const buttons = [...document.querySelectorAll('[data-plan]')];
  const native = window.Capacitor?.Plugins?.MariamiBilling;
  const reference = {monthly:'$2.50',quarterly:'$6.70','half-yearly':'$15.78',yearly:'$31.56'};
  const readyPlans = new Set();
  let ready = false, active = false, busy = false;
  function controls() { buttons.forEach(b => { b.disabled = !ready || active || busy || !readyPlans.has(b.dataset.plan); }); restore.disabled = !native || !ready || busy; }
  function say(text) { status.textContent = text; }
  async function session() {
    const auth = window.EWM_AUTH;
    const result = await auth?.waitForSession(8000);
    if (!result?.session?.access_token || !result.session.user?.id) {
      signIn.hidden = false;
      throw new Error('გთხოვ, ჯერ შეხვიდე შენს ანგარიშში.');
    }
    signIn.hidden = true;
    return result.session;
  }
  async function api(action, token) {
    const user = await session();
    const response = await fetch(window.SUPABASE_URL + '/functions/v1/play-subscription', {
      method:'POST', headers: { 'Content-Type':'application/json', apikey: window.SUPABASE_PUBLISHABLE_KEY || window.SUPABASE_KEY,
        Authorization: 'Bearer ' + user.access_token }, body: JSON.stringify({ action, ...(token ? {token} : {}) })
    });
    if (!response.ok) throw new Error('გამოწერის სერვისი ჯერ მიუწვდომელია. თანხის გადახდამდე სცადე მოგვიანებით ან დაუკავშირდი მხარდაჭერას.');
    const data = await response.json();
    if (data.ready !== true || typeof data.active !== 'boolean') throw new Error('გამოწერა ვერ დადასტურდა.');
    return data;
  }
  function result(data) {
    active = data.active;
    say(active ? 'ყველა კლასზე წვდომა დადასტურებულია.' : 'აირჩიე სასურველი პერიოდი. გადახდა გაიხსნება Google Play-ში.');
    controls();
  }
  async function verify(purchases) {
    let pending = false;
    for (const purchase of purchases || []) {
      if (purchase.state === 2) { pending = true; continue; }
      if (purchase.state === 1 && typeof purchase.token === 'string') await api('verify', purchase.token);
    }
    result(await api('status'));
    if (pending && !active) say('გადახდა მოლოდინშია. წვდომა ჩაირთვება მხოლოდ გადახდის დადასტურების შემდეგ.');
  }
  async function init() {
    controls();
    if (!native) {
      for (const [id, price] of Object.entries(reference)) document.querySelector(`[data-price="${id}"]`).textContent = price;
      say('ეს არის აშშ დოლარის საბაზო ფასები. გამოწერა ხელმისაწვდომი გახდება Android აპში Google Play-ის მეშვეობით; ადგილობრივი ფასი შეძენამდე გამოჩნდება.');
      return;
    }
    try {
      const data = await api('status');
      if (data.access === 'admin' && data.active === true) {
        active = true;
        document.querySelector('.plans').hidden = true;
        say('ადმინისტრატორის წვდომა დადასტურებულია. გამოწერის შეძენა არ გჭირდება.');
        controls();
        return;
      }
      await native.addListener('purchasesUpdated', async event => {
        try {
          if (event.code === 1) say('გადახდა გაუქმებულია.');
          else if (event.code !== 0) say('Google Play-ის გადახდა ვერ დასრულდა. სცადე შესყიდვების აღდგენა.');
          else await verify(event.purchases);
        } catch (error) { say(error.message); }
        finally { busy = false; controls(); }
      });
      const found = await native.getPlans();
      for (const plan of found.plans || []) {
        if (!Object.hasOwn(reference, plan.id) || typeof plan.price !== 'string') continue;
        readyPlans.add(plan.id);
        document.querySelector(`[data-price="${plan.id}"]`).textContent = plan.price;
      }
      ready = readyPlans.size > 0;
      if (!ready) throw new Error('გამოწერის გეგმები Google Play-ში ჯერ მიუწვდომელია.');
      result(data);
    } catch (error) { ready = false; say(error.message); controls(); }
  }
  buttons.forEach(button => button.addEventListener('click', async () => {
    if (!ready || active || busy) return;
    busy = true; controls();
    try {
      // Recheck server status immediately before opening any chargeable purchase flow.
      const data = await api('status');
      if (data.active) { result(data); busy = false; controls(); return; }
      const user = await session();
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(user.user.id));
      const account = [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2,'0')).join('');
      say('მიმდინარეობს Google Play-ის გადახდის გახსნა…');
      await native.purchase({ plan: button.dataset.plan, account });
    } catch (error) { busy = false; say(error.message); controls(); }
  }));
  restore.addEventListener('click', async () => {
    if (!ready || busy) return;
    busy = true; controls();
    try { await verify((await native.restore()).purchases); }
    catch (error) { say(error.message); }
    finally { busy = false; controls(); }
  });
  init();
})();
