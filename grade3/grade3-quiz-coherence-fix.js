/* Grade 3 quiz coherence fix.
   Safe additive layer: aligns W19 quiz vocabulary with the curated W19 pack.
   Keeps world IDs/order, quiz count, XP, progress and Supabase logic unchanged. */
(function(){
  'use strict';
  var c=window.GRADE3_FUTURISTIC_CONTENT;
  if(!c||!Array.isArray(c.worlds))return;
  c.worlds.forEach(function(w){
    if(w.id!=='19')return;
    w.quiz=[
      {q:'What is the opposite of tall?',options:['short','fast','happy'],answer:0,type:'vocabulary'},
      {q:'What is the opposite of fast?',options:['slow','tall','young'],answer:0,type:'vocabulary'},
      {q:'Choose the correct sentence.',options:['The turtle is slow.','The turtle are slow.','The turtle am slow.'],answer:0,type:'grammar'},
      {q:'Which pair are opposites?',options:['tall and short','young and kind','fast and quick'],answer:0,type:'vocabulary'},
      {q:'Complete: The car is ___.',options:['fast','fastly','fasterly'],answer:0,type:'grammar'},
      {q:'Listening: Which two words are opposites?',options:['tall and short','young and kind','fast and quick'],answer:0,type:'listening'}
    ];
  });
  window.GRADE3_QUIZ_COHERENCE_FIX_VERSION=1;
})();
