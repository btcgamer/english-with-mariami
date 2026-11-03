(() => {
  'use strict';
  const discovered = new Set();
  const cards = document.querySelectorAll('.spell-card');
  const status = document.querySelector('[data-spell-status]');
  const dots = document.querySelectorAll('.spell-dots i');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const open = card.getAttribute('aria-pressed') !== 'true';
      card.setAttribute('aria-pressed', String(open));
      card.querySelector('.spell-front').setAttribute('aria-hidden', String(open));
      card.querySelector('.spell-back').setAttribute('aria-hidden', String(!open));
      const word = card.dataset.word;
      card.setAttribute('aria-label', open ? `${word} — ${card.querySelector('.spell-back strong').textContent}` : `${word} — მნიშვნელობის აღმოჩენა`);
      if (open) discovered.add(word);
      dots.forEach((dot, index) => dot.classList.toggle('lit', index < discovered.size));
      status.textContent = discovered.size === cards.length ? 'სამივე სიტყვა აღმოჩენილია. შესანიშნავია!' : `აღმოჩენილია ${discovered.size} / ${cards.length} სიტყვა`;
    });
  });
  let frame = 0;
  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--read-progress', String(max > 0 ? Math.min(1, scrollY / max) : 0));
    frame = 0;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(progress); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('load', schedule, { once: true });
  progress();
})();
