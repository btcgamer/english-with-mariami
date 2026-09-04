/* Grade 3 — final runtime quiz sanitizer.
   Runs after all content/quiz layers and before grade3.js renders quizzes.
   Converts object-valued visible quiz fields to human-readable text without
   changing numeric answer indexes or quiz scoring semantics. */
(function(){
  'use strict';
  var c=window.GRADE3_FUTURISTIC_CONTENT;
  if(!c||!Array.isArray(c.worlds))return;
  function text(v){
    if(v==null)return '';
    if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return String(v);
    if(typeof v==='object'){
      var candidate=v.text??v.label??v.option??v.value??v.answer??v.name??v.title??v.question??v.content??v.example;
      return candidate!=null&&typeof candidate!=='object'?String(candidate):'';
    }
    return '';
  }
  c.worlds.forEach(function(w){
    if(!w||!Array.isArray(w.quiz))return;
    w.quiz=w.quiz.map(function(q){
      if(!q||typeof q!=='object')return q;
      if(q.question!=null)q.question=text(q.question);
      if(Array.isArray(q.options))q.options=q.options.map(text).filter(Boolean);
      if(q.answer!=null&&typeof q.answer==='object')q.answer=text(q.answer);
      if(q.explanation!=null&&typeof q.explanation==='object')q.explanation=text(q.explanation);
      return q;
    });
  });
  window.GRADE3_QUIZ_RUNTIME_SANITIZER_VERSION=1;
})();
