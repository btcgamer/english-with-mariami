/* English with Mariami — Grade 3 progression audit
   Safe planning layer only. Does not change lessons, progress, quiz, auth, or Supabase.
   Purpose: make repeated Grade 2 topics intentional by adding a Grade 3 extension target.
*/
(function(){
  'use strict';

  window.GRADE3_PROGRESSION_AUDIT = {
    version: 1,
    principle: 'revisit + extend, not repeat unchanged',
    bridges: [
      { topic:'Everyday English', grade2:'basic greetings', grade3:'introductions + polite phrases + complete answers', extension:'short dialogue' },
      { topic:'Numbers', grade2:'counting', grade3:'age + simple maths + time', extension:'How many? / There are...' },
      { topic:'Colors', grade2:'name colors', grade3:'describe objects and people', extension:'It is / They are + adjective' },
      { topic:'Family', grade2:'family words', grade3:'describe family members', extension:'This is my... + person description' },
      { topic:'Home', grade2:'rooms and objects', grade3:'location and room description', extension:'There is / There are' },
      { topic:'Animals', grade2:'name animals', grade3:'abilities and habitats', extension:'It can / It has' },
      { topic:'Food', grade2:'food words', grade3:'preferences and healthy choices', extension:'I like / I don’t like + dialogue' },
      { topic:'School', grade2:'school objects', grade3:'classroom communication', extension:'This is / These are + instructions' },
      { topic:'Weather', grade2:'basic weather', grade3:'weather + seasons + clothing', extension:'daily weather report' },
      { topic:'Body', grade2:'body parts', grade3:'movement and abilities', extension:'I have got... + listen and do' },
      { topic:'Feelings', grade2:'basic emotions', grade3:'express and respond to feelings', extension:'I feel / I am + question-answer' }
    ],
    new_grade3_skills: [
      'Present Simple',
      'Time and schedules',
      'Prepositions',
      'Reading comprehension',
      'Listening comprehension',
      'Speaking conversations',
      'Word families and opposites',
      'Mixed assessment',
      'Sentence puzzles',
      'Adaptive challenge'
    ]
  };
})();
