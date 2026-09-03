/* Grade 3 content-shape compatibility layer. Keeps legacy string quizzes usable by the main quiz engine. */
(function(){
  'use strict';
  var content=window.GRADE3_FUTURISTIC_CONTENT;
  if(!content||!Array.isArray(content.worlds))return;
  content.worlds.forEach(function(w){
    if(typeof w.quiz==='string'&&w.quiz.trim()){
      var s=w.quiz.trim(),i=s.indexOf('?');
      w.quiz=[{q:i>=0?s.slice(0,i+1):s,options:[],answer:i>=0?s.slice(i+1).trim().replace(/[.!]+$/,''):s.replace(/[.!]+$/,''),type:'fill'}];
    }
  });
})();
