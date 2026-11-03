(() => {
  'use strict';
  const controls = [...document.querySelectorAll('[data-grade-range]')];
  const portals = [...document.querySelectorAll('.academy-grade-portals a')];
  const status = document.querySelector('.enchanted-filter-status');
  let range = 'all';
  const gradeOf = link => Number(new URL(link.href).searchParams.get('grade'));
  function apply(value) {
    range = value;
    const [min, max] = value === 'all' ? [1, 12] : value.split('-').map(Number);
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.gradeRange === value)));
    let count = 0;
    portals.forEach(portal => {
      const grade = gradeOf(portal);
      portal.hidden = grade < min || grade > max;
      if (!portal.hidden) count++;
    });
    status.textContent = value === 'all' ? `${count} სასწავლო პორტალი` : `${count} სასწავლო პორტალი · კლასები ${min}–${max}`;
  }
  controls.forEach(button => button.addEventListener('click', () => apply(button.dataset.gradeRange)));
  document.addEventListener('mariami:lesson-rendered', () => {
    const grade = Number(document.getElementById('grade').value);
    const current = portals.find(link => gradeOf(link) === grade);
    if (range !== 'all' && current?.hidden) apply('all');
  });
})();
