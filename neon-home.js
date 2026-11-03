(() => {
  'use strict';
  const scene = document.querySelector('[data-neon-scene]');
  if (!scene) return;
  const button = document.querySelector('.motion-control');
  const label = button.querySelector('.motion-label');
  const symbol = button.querySelector('.motion-symbol');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = reduced.matches;
  let frame = 0;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    scene.style.setProperty('--tilt-x', '0deg');
    scene.style.setProperty('--tilt-y', '0deg');
  };
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused);
    button.setAttribute('aria-pressed', String(paused));
    label.textContent = paused ? 'ანიმაციის ჩართვა' : 'ანიმაციის შეჩერება';
    symbol.textContent = ''; 
    // Respect the OS preference even if the user requests motion here.
    button.disabled = reduced.matches;
    if (reduced.matches) label.textContent = 'შემცირებული მოძრაობა';
    reset();
  }
  button.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });
  finePointer.addEventListener('change', reset);
  scene.addEventListener('pointermove', event => {
    if (paused || reduced.matches || !finePointer.matches) return;
    const rect = scene.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      scene.style.setProperty('--tilt-x', `${-y * 5}deg`);
      scene.style.setProperty('--tilt-y', `${x * 7}deg`);
      frame = 0;
    });
  });
  scene.addEventListener('pointerleave', reset);
  scene.addEventListener('pointercancel', reset);
  const particles = scene.querySelector('.scene-particles');
  for (let i = 0; i < 18; i++) {
    const dot = document.createElement('i');
    dot.style.left = `${6 + (i * 29) % 88}%`;
    dot.style.top = `${8 + (i * 37) % 81}%`;
    dot.style.setProperty('--duration', `${6 + i % 5}s`);
    dot.style.setProperty('--delay', `${-(i % 7)}s`);
    particles.appendChild(dot);
  }
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('tab-inactive', document.hidden);
    if (document.hidden) reset();
  });
  updateMotion();
})();
