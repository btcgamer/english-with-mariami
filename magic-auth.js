(() => {
  'use strict';
  const world = document.querySelector('.auth-world');
  const visual = document.querySelector('#mm11Workspace .mm11-visual');
  if (world && visual) visual.prepend(world);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.querySelector('.auth-motion');
  let paused = false;
  function sync() {
    const stopped = paused || reduced.matches;
    document.body.classList.toggle('auth-magic-paused', stopped);
    motion.setAttribute('aria-pressed', String(stopped));
    motion.disabled = reduced.matches;
    motion.lastElementChild.textContent = reduced.matches ? 'შემცირებული მოძრაობა' : paused ? 'ფონის ჩართვა' : 'ფონის შეჩერება';
  }
  motion.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('auth-tab-hidden', document.hidden));
  sync();
  const password = document.getElementById('password');
  if (password) {
    const wrap = document.createElement('div'); wrap.className = 'auth-password-wrap';
    password.before(wrap); wrap.append(password);
    const reveal = document.createElement('button'); reveal.type = 'button'; reveal.className = 'auth-password-toggle'; reveal.setAttribute('aria-pressed','false'); reveal.setAttribute('aria-controls','password'); reveal.textContent = 'ჩვენება'; reveal.setAttribute('aria-label','პაროლის ჩვენება');
    reveal.addEventListener('click', () => {
      const visible = password.type === 'password'; password.type = visible ? 'text' : 'password';
      reveal.setAttribute('aria-pressed',String(visible)); reveal.textContent = visible ? 'დამალვა' : 'ჩვენება'; reveal.setAttribute('aria-label',visible ? 'პაროლის დამალვა' : 'პაროლის ჩვენება');
    }); wrap.append(reveal);
  }
})();
