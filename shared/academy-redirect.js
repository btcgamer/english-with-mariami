/* Preserve known grade/range deep links; never accept an external redirect. */
(() => {
  'use strict';
  const input = new URLSearchParams(location.search);
  const target = new URL('academy.html', location.href);
  const range = input.get('range');
  const allowed = ['1-4', '5-8', '9-12'];
  if (allowed.includes(range)) target.searchParams.set('range', range);
  const grade = Number(input.get('grade'));
  if (Number.isInteger(grade) && grade >= 1 && grade <= 12) target.searchParams.set('grade', grade);
  else if (allowed.includes(range)) target.searchParams.set('grade', range.split('-')[0]);
  target.hash = 'grade-portals';
  const link = document.getElementById('academy-redirect');
  if (link) link.href = target.href;
  location.replace(target.href);
})();
