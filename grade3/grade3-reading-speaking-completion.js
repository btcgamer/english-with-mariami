/* Grade 3 Reading + Speaking completion layer.
   Safe additive layer: fills missing W11–W24 practice content only.
   Keeps world IDs/order, quiz, XP, progress and Supabase logic unchanged. */
(function(){
  'use strict';
  var c=window.GRADE3_FUTURISTIC_CONTENT;
  if(!c||!Array.isArray(c.worlds))return;
  var packs={
    '11':{
      reading:'Mia feels excited because she has an English mission today. She was worried at first, but she stays calm and tries again. At the end, she feels proud of her work.',
      speaking:'Say how you feel today: “I feel ____. I am ____ because ____.”'
    },
    '12':{
      reading:'Ben is learning how sentences work. He looks for the subject and the verb. He knows that is and are are forms of be, and he uses do or does to ask simple questions.',
      speaking:'Make three sentences: “I am ____. I have ____. Can you ____?”'
    },
    '13':{
      reading:'Lika wakes up at seven every day. She gets dressed, has breakfast and goes to school. After school she studies, does her homework and goes home.',
      speaking:'Describe your daily routine using three actions: “I wake up ____. I ____ breakfast. I ____ to school.”'
    },
    '14':{
      reading:'On Monday, Luka starts school at nine o’clock. On Friday he finishes the school week. He checks his calendar to remember the days and times.',
      speaking:'Say three days and one time: “On ____, I ____. It starts at ____ o’clock.”'
    },
    '15':{
      reading:'The blue bag is beside the desk. A book is above the bag, and a pencil is inside the bag. A chair is in front of the desk.',
      speaking:'Describe where three objects are: “The ____ is beside ____. The ____ is above ____.”'
    },
    '16':{
      reading:'At the beginning of the story, Mia finds a lost puppy. The problem is that the puppy cannot find its home. After Mia asks for help, they find a solution and take the puppy home.',
      speaking:'Retell a short story with three parts: “At the beginning ____. In the middle ____. At the end ____.”'
    },
    '17':{
      reading:'Tom listens carefully to a short message. He hears the key words blue bag and under the chair. He repeats the important phrase slowly and checks the detail again.',
      speaking:'Practice a listening phrase aloud: “I hear ____. The key word is ____.”'
    },
    '18':{
      reading:'Nana asks questions to learn about her new friend. She asks where he lives, when he plays football and why he likes English. He answers each question in a complete sentence.',
      speaking:'Ask and answer three questions: “What is your name? Where do you live? Why do you like English?”'
    },
    '19':{
      reading:'The young boy is tall and strong, but his little brother is short. Their clean room is next to a dirty garden path. A fast dog runs past a slow turtle.',
      speaking:'Describe two people or animals using opposites: “The ____ is tall, but the ____ is short. The ____ is fast, but the ____ is slow.”'
    },
    '20':{
      reading:'Before starting a quiz, Sara reads each question carefully. She chooses an option, checks her answer and looks at her result. If she makes a mistake, she retries the question.',
      speaking:'Explain your quiz routine: “First I ____. Then I ____. I check my answer and retry if I am wrong.”'
    },
    '21':{
      reading:'Leo builds a sentence puzzle. First he finds the words, then he puts them in the correct order. A clue helps him match two words, and he checks the final pattern.',
      speaking:'Build a sentence aloud and explain the order: “First ____. Next ____. Last ____.”'
    },
    '22':{
      reading:'After a practice session, Ana reviews what she learned. She notices that reading is strong but speaking is difficult. She sets a goal and practices speaking every day to improve.',
      speaking:'Talk about your learning goal: “I am good at ____. I want to improve ____. I practice ____ every day.”'
    },
    '23':{
      reading:'An AI English challenge gives Niko a new mission. He focuses on the clues, tries a strategy and remembers what he learned before. He is ready to attempt the next level.',
      speaking:'Describe your strategy: “I am ready. I will focus on ____. I will try ____. My goal is ____.”'
    },
    '24':{
      reading:'The final Grade 3 mission reviews grammar, vocabulary, reading, listening and speaking. Mariami checks her progress, practices difficult skills and speaks with more confidence. She is ready for the next level.',
      speaking:'Give your final English review: “I learned ____. I can ____. I want to improve ____. I am ready for the next level.”'
    }
  };
  c.worlds.forEach(function(w){
    var p=packs[w.id];
    if(!p)return;
    if(!w.reading)w.reading=p.reading;
    if(!w.speaking)w.speaking=p.speaking;
  });
  window.GRADE3_READING_SPEAKING_COMPLETION_VERSION=1;
})();
