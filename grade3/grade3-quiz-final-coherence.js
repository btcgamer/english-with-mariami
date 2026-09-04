/* Grade 3 final quiz coherence layer.
   Safe additive layer: aligns selected W11/W14/W15/W17/W18/W21/W22/W24 quiz wording
   with the curated lesson vocabulary and practice content.
   Keeps world IDs/order, six-question quiz count, XP, progress and Supabase logic unchanged. */
(function(){
  'use strict';
  var c=window.GRADE3_FUTURISTIC_CONTENT;
  if(!c||!Array.isArray(c.worlds))return;
  var q=function(a){return a.map(function(x,i){var options=x[1].slice();var shift=i%3;for(var n=0;n<shift;n++)options.push(options.shift());return {q:x[0],options:options,answer:(3-shift)%3,type:x[2]};});};
  var packs={
    '11':q([
      ['Which word means “აღფრთოვანებული”?',['excited','worried','bored'],'vocabulary'],
      ['Complete: I ___ proud today.',['am','is','are'],'grammar'],
      ['Which feeling is the opposite of worried?',['calm','nervous','scared'],'vocabulary'],
      ['How might you feel before a new mission?',['excited','bored','dirty'],'reading'],
      ['Choose the correct sentence.',['She is friendly.','She are friendly.','She am friendly.'],'grammar'],
      ['Listening: How does the speaker feel?',['proud','angry','sad'],'listening']
    ]),
    '14':q([
      ['Which day comes after Monday?',['Tuesday','Friday','Sunday'],'vocabulary'],
      ['Complete: School starts ___ nine o’clock.',['at','on','in'],'grammar'],
      ['Which word means a group of seven days?',['week','month','calendar'],'vocabulary'],
      ['Which day is in the weekend?',['Saturday','Tuesday','Friday'],'reading'],
      ['Choose the correct phrase.',['on Monday','at Monday','in Monday'],'grammar'],
      ['Listening: What helps you remember days and times?',['calendar','garden','window'],'listening']
    ]),
    '15':q([
      ['Where is the book?',['above the bag','inside the garden','far from the room'],'reading'],
      ['Complete: The bag is ___ the desk.',['beside','at','to'],'grammar'],
      ['Which word means “შიგნით”?',['inside','outside','opposite'],'vocabulary'],
      ['If the ball is below the table, where is it?',['below the table','above the table','outside the table'],'vocabulary'],
      ['Choose the correct sentence.',['The book is inside the bag.','The book are inside the bag.','The book is inside bag.'],'grammar'],
      ['Listening: Where is the object?',['in front of the desk','far from the school','opposite the garden'],'listening']
    ]),
    '17':q([
      ['Where is the key word?',['in the message','in the classroom','inside the bag'],'reading'],
      ['Complete: Please ___ carefully.',['listen','listens','listening'],'grammar'],
      ['Which word means “ხმა”?',['voice','detail','speaker'],'vocabulary'],
      ['What should you do after you hear a key word?',['repeat it','hide it','forget it'],'speaking'],
      ['Choose the correct phrase.',['Listen carefully.','Listens carefully.','Listening carefully.'],'grammar'],
      ['Listening: What should you listen for?',['a key word','a window','a table'],'listening']
    ]),
    '18':q([
      ['Which word asks about a place?',['where','when','why'],'vocabulary'],
      ['Complete: ___ do you live?',['Where','Who','What'],'grammar'],
      ['Which word asks about a reason?',['why','where','which'],'vocabulary'],
      ['Which question asks about a person?',['Who is your friend?','When is school?','Where is the book?'],'speaking'],
      ['Choose the correct sentence.',['I answer the question.','I answers the question.','I answering the question.'],'grammar'],
      ['Listening: Which question do you hear?',['Why do you like English?','Where is the bag?','What is the answer?'],'listening']
    ]),
    '21':q([
      ['What comes first in a sequence?',['first','last','different'],'vocabulary'],
      ['Complete: ___, the next step is easy.',['First','Last','Same'],'grammar'],
      ['Which word means a correct arrangement?',['order','clue','pair'],'vocabulary'],
      ['What can a clue help you find?',['a pattern','a chair','a window'],'reading'],
      ['Choose the correct phrase.',['The pair is the same.','The pair are the same.','The pair am the same.'],'grammar'],
      ['Listening: What should you check at the end?',['the pattern','the garden','the door'],'listening']
    ]),
    '22':q([
      ['What does practice help you do?',['improve','forget','stop'],'reading'],
      ['Which word means “მიზანი”?',['goal','skill','success'],'vocabulary'],
      ['Complete: I ___ English every day.',['practice','practices','practicing'],'grammar'],
      ['What can you improve with practice?',['a skill','a window','a chair'],'speaking'],
      ['Choose the correct sentence.',['I learn English.','I learns English.','I learning English.'],'grammar'],
      ['Listening: What should you practice?',['a difficult skill','only colors','only numbers'],'listening']
    ]),
    '24':q([
      ['What does a final review include?',['grammar and vocabulary','only lunch','only weather'],'reading'],
      ['Which word means “თავდაჯერება”?',['confidence','practice','review'],'vocabulary'],
      ['Complete: I ___ English every day.',['practice','practices','practicing'],'grammar'],
      ['Which skill is part of the final mission?',['speaking','running','drawing'],'reading'],
      ['Choose the correct sentence.',['I review my English.','I reviews my English.','I reviewing my English.'],'grammar'],
      ['Listening: What are you ready for?',['the next level','the weather','the garden'],'listening']
    ])
  };
  c.worlds.forEach(function(w){if(packs[w.id])w.quiz=packs[w.id];});
  window.GRADE3_QUIZ_FINAL_COHERENCE_VERSION=3;
})();
