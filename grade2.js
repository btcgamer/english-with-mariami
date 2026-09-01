/* Grade 2 lesson bridge — opens the REAL Grade 2 interactive lesson pages.
   Mapping is aligned with the Supabase Grade 2 curriculum.
*/
(function () {
  'use strict';

  /*
    Grade 2 Supabase curriculum currently contains:
      1  Hello!
      2  My Family
      3  My Colors
      4  Numbers
      5  My Body
      6  Animals
      7  Food
      8  My Toys
      9  My School
      10 Weather
      11 My Clothes
      12 My Day
  */
  var lessonNumbers = {
    animals: 6,
    numbers: 4,
    colors: 3,
    family: 2,
    home: 8,
    food: 7,
    clothes: 11,
    weather: 10,
    school: 9,
    transport: 1,
    nature: 12,
    final: 12
  };

  function getLessonUrl(id) {
    var number = lessonNumbers[String(id || '').toLowerCase()];
    if (!number) return null;
    return 'lesson.html?grade=2&lesson=' + encodeURIComponent(number) + '&v=20260901';
  }

  function openRealLesson(id) {
    var url = getLessonUrl(id);
    if (!url) return false;

    /* Use location.assign so the browser performs a real document navigation. */
    window.location.assign(url);
    return true;
  }

  function findLessonButton(target) {
    if (!target) return null;
    if (target.closest) return target.closest('[data-lesson]');
    return null;
  }

  function intercept(event) {
    var button = findLessonButton(event.target);
    if (!button) return;

    var id = button.getAttribute('data-lesson');
    var url = getLessonUrl(id);
    if (!url) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    window.location.assign(url);
  }

  /* Capture phase guarantees the real lesson navigation wins over decorative UI listeners. */
  document.addEventListener('click', intercept, true);

  document.addEventListener('DOMContentLoaded', function () {
    var continueButton = document.getElementById('continueBtn');
    if (continueButton) {
      continueButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        openRealLesson('animals');
      }, true);
    }

    var reviewButton = document.getElementById('reviewBtn');
    if (reviewButton) {
      reviewButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        openRealLesson('final');
      }, true);
    }
  });

  /* Expose a safe helper for debugging from the console. */
  window.EnglishWithMariamiGrade2 = window.EnglishWithMariamiGrade2 || {};
  window.EnglishWithMariamiGrade2.openLesson = openRealLesson;
  window.EnglishWithMariamiGrade2.lessonNumbers = lessonNumbers;
})();
