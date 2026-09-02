/* Grade 3 quiz compatibility — keeps the original curriculum while normalizing legacy quiz data. */
(function(){
  'use strict';
  var source = window.GRADE3_FUTURISTIC_CONTENT;
  if (!source || !Array.isArray(source.worlds)) return;

  function legacyToFill(value){
    var raw = String(value || '').trim();
    if (!raw) return null;
    var match = raw.match(/^(.+?\?)\s*(?:—|–|-|:)\s*(.+)$/);
    if (!match) match = raw.match(/^(.+?\?)\s+(.+)$/);
    if (!match) {
      /*
       * Some legacy Grade 3 sectors store a short prompt/answer as a single
       * string without a question mark (for example: "He plays football.").
       * Do not manufacture a blank answer: the native Grade 3 engine treats
       * an unparsed legacy string as a fill item whose answer is the string.
       * Keeping that behavior prevents the compatibility layer from turning
       * otherwise usable legacy quizzes into impossible blank-answer inputs.
       */
      return {
        type:'fill',
        question:raw,
        answer:raw.replace(/[.。]+$/,'').trim()
      };
    }
    return {
      type:'fill',
      question:match[1].trim(),
      answer:match[2].trim().replace(/[.。]+$/,'')
    };
  }

  source.worlds.forEach(function(world){
    if (!Array.isArray(world.quiz)) {
      if (typeof world.quiz === 'string') {
        var converted = legacyToFill(world.quiz);
        world.quiz = converted ? [converted] : [];
      } else {
        world.quiz = [];
      }
    }

    world.quiz = world.quiz.map(function(item){
      if (typeof item === 'string') return legacyToFill(item);
      if (!item || typeof item !== 'object') return null;
      var quiz = Object.assign({}, item);
      if (!quiz.question && quiz.q) quiz.question = quiz.q;
      if (!quiz.type || quiz.type === 'choice' || quiz.type === 'grammar' || quiz.type === 'vocabulary' || quiz.type === 'reading' || quiz.type === 'listening' || quiz.type === 'math' || quiz.type === 'speaking') {
        quiz.type = Array.isArray(quiz.options) && quiz.options.length ? 'mcq' : 'fill';
      }
      return quiz;
    }).filter(Boolean);
  });
})();
