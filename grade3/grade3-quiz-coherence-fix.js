/* Grade 3 quiz coherence fix.
   Safe additive layer: aligns W13 daily-routine and W19 body/description quiz content
   with the curated lesson vocabulary and practice content.
   Keeps world IDs/order, quiz count, XP, progress and Supabase logic unchanged. */
(function(){
  'use strict';
  var c=window.GRADE3_FUTURISTIC_CONTENT;
  if(!c||!Array.isArray(c.worlds))return;
  c.worlds.forEach(function(w){
    if(w.id==='13'){
      w.quiz=[
        {q:'What does Lika do first in the morning?',options:['She wakes up.','She does her homework.','She goes home.'],answer:0,type:'reading'},
        {q:'Complete: I ___ up at seven every day.',options:['wake','wakes','waking'],answer:0,type:'grammar'},
        {q:'What does Lika do before she goes to school?',options:['She gets dressed and has breakfast.','She does her homework.','She goes home.'],answer:0,type:'reading'},
        {q:'Choose the correct sentence.',options:['She studies after school.','She study after school.','She studying after school.'],answer:0,type:'grammar'},
        {q:'What does Lika do after school?',options:['She studies and does her homework.','She wakes up.','She gets dressed for school.'],answer:0,type:'reading'},
        {q:'Listening: Where does Lika go every day?',options:['school','garden','shop'],answer:0,type:'listening'}
      ];
      return;
    }
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
  window.GRADE3_QUIZ_COHERENCE_FIX_VERSION=2;
})();
