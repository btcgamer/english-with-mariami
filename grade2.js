/* Grade 2 REAL LESSON NAVIGATION
   This file intentionally wins over the decorative demo/modal handlers
   embedded in grade2.html. Every mission opens the existing interactive
   lesson engine at /lesson.html using the real Supabase Grade 2 lesson number.
*/
(function () {
  'use strict';

  var lessonNumbers = Object.freeze({
    animals: 6,
    numbers: 4,
    colors: 3,
    family: 2,
    home: 14,
    food: 7,
    clothes: 11,
    weather: 10,
    school: 9,
    transport: 1,
    nature: 12,
    final: 12
  });

  function normalizeId(value) {
    return String(value || '').trim().toLowerCase();
  }

  function lessonUrl(id) {
    var number = lessonNumbers[normalizeId(id)];
    if (!number) return null;
    return '/lesson.html?grade=2&lesson=' + encodeURIComponent(number) + '&v=20260901';
  }

  function navigate(id) {
    var url = lessonUrl(id);
    if (!url) return false;

    /* Hard document navigation: no modal, no SPA interception. */
    window.location.replace(url);
    return true;
  }

  function getLessonFromTarget(target) {
    if (!target) return null;
    var element = target.closest ? target.closest('[data-lesson]') : null;
    return element ? element.getAttribute('data-lesson') : null;
  }

  /* Pointer events fire before the later click handlers in grade2.html. */
  document.addEventListener('pointerup', function (event) {
    var id = getLessonFromTarget(event.target);
    if (!id || !lessonUrl(id)) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    navigate(id);
  }, true);

  /* Keyboard activation / fallback. */
  document.addEventListener('click', function (event) {
    var id = getLessonFromTarget(event.target);
    if (!id || !lessonUrl(id)) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    navigate(id);
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    var continueButton = document.getElementById('continueBtn');
    if (continueButton) {
      continueButton.addEventListener('pointerup', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigate('animals');
      }, true);

      continueButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigate('animals');
      }, true);
    }

    var reviewButton = document.getElementById('reviewBtn');
    if (reviewButton) {
      reviewButton.addEventListener('pointerup', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigate('final');
      }, true);

      reviewButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigate('final');
      }, true);
    }
  });

  window.EnglishWithMariamiGrade2 = window.EnglishWithMariamiGrade2 || {};
  window.EnglishWithMariamiGrade2.openLesson = navigate;
  window.EnglishWithMariamiGrade2.lessonNumbers = lessonNumbers;
})();
