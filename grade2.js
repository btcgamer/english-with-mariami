/* Grade 2 lesson bridge — opens the real interactive lesson page.
   The Grade 2 visual shell can stay unchanged; this file replaces the old
   demo/modal behavior with the existing Supabase-powered lesson.html.
*/
(function () {
  'use strict';

  var lessonNumbers = {
    animals: 1,
    numbers: 2,
    colors: 3,
    family: 4,
    home: 5,
    food: 6,
    clothes: 7,
    weather: 8,
    school: 9,
    transport: 10,
    nature: 11,
    final: 12
  };

  function openRealLesson(id) {
    var number = lessonNumbers[String(id || '').toLowerCase()];
    if (!number) return false;
    window.location.href = 'lesson.html?grade=2&lesson=' + encodeURIComponent(number);
    return true;
  }

  function intercept(event) {
    var button = event.target && event.target.closest
      ? event.target.closest('[data-lesson]')
      : null;

    if (!button) return;

    var id = button.getAttribute('data-lesson');
    if (!openRealLesson(id)) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }

  document.addEventListener('click', intercept, true);

  /* Continue Mission now opens the first real Grade 2 lesson. */
  document.addEventListener('DOMContentLoaded', function () {
    var continueButton = document.getElementById('continueBtn');
    if (continueButton) {
      continueButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openRealLesson('animals');
      }, true);
    }

    var reviewButton = document.getElementById('reviewBtn');
    if (reviewButton) {
      reviewButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openRealLesson('final');
      }, true);
    }
  });
})();
