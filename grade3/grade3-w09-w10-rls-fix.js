/* Grade 3 W09/W10 RLS content fix.
   Safe additive layer: only enriches existing worlds 09 and 10.
   Keeps world IDs/order, quiz data, progress keys and XP logic unchanged.
*/
(function(){
  'use strict';
  const worlds = window.GRADE3_FUTURISTIC_CONTENT && window.GRADE3_FUTURISTIC_CONTENT.worlds;
  if(!Array.isArray(worlds)) return;

  const additions = {
    '09': {
      reading: 'Today the weather is cool and windy. Dark clouds are in the sky. Mia puts on her jacket and takes an umbrella. In spring, the weather can change quickly. Mia is ready for a rainy afternoon.',
      speaking: 'Look outside and say: “Today it is ____. I can see ____. I wear ____.”'
    },
    '10': {
      reading: 'Tom has two eyes, two ears, two hands and two legs. He uses his eyes to see and his ears to hear. In the morning, Tom moves his arms, runs and jumps. He likes to stay active and healthy.',
      speaking: 'Point to three body parts and say: “This is my ____. I have two ____. I can ____.”'
    }
  };

  worlds.forEach(function(w){
    const add = additions[w.id];
    if(!add) return;
    w.reading = add.reading;
    w.speaking = add.speaking;
  });
})();
