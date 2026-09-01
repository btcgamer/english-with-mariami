/* English with Mariami — Grade 2 curriculum map
   Safe planning layer: does not change progress, quiz logic, or existing mission IDs.
   Vocabulary and language progression is mapped to the current Grade 2 missions.
*/
(function () {
  'use strict';

  window.GRADE2_CURRICULUM_MAP = [
    { id: 1, key: 'animals', title: 'Animals', goal: 'Identify familiar animals and use simple sentences about them.', vocabulary: ['cat','dog','bird','fish','lion','elephant','monkey','rabbit'], language: ['This is a ...','I have a ...','It can ...'], practice: 'matching, speaking and listening', review: 'basic nouns' },
    { id: 2, key: 'numbers', title: 'Numbers & Counting', goal: 'Recognize and use numbers in simple counting and classroom examples.', vocabulary: ['one','two','three','four','five','six','seven','ten'], language: ['How many?','I have ...','There are ...'], practice: 'counting game', review: 'numbers in context' },
    { id: 3, key: 'colors', title: 'Colors', goal: 'Identify common colors and describe familiar objects.', vocabulary: ['red','blue','green','yellow','black','white','orange','purple'], language: ['It is red.','A blue bag.','What color is it?'], practice: 'visual recognition and speaking', review: 'colors with nouns' },
    { id: 4, key: 'family', title: 'Family', goal: 'Name close family members and use simple family sentences.', vocabulary: ['mother','father','sister','brother','grandma','grandpa','family'], language: ['This is my ...','He is my ...','She is my ...'], practice: 'family picture speaking', review: 'people and pronouns' },
    { id: 5, key: 'home', title: 'Home', goal: 'Name familiar rooms and objects and describe simple locations.', vocabulary: ['house','room','door','window','bed','table','chair','kitchen'], language: ['This is my ...','It is in the ...','The book is on ...'], practice: 'location sentences', review: 'objects and places' },
    { id: 6, key: 'food', title: 'Food & Drinks', goal: 'Name common foods and drinks and express simple preferences.', vocabulary: ['apple','banana','bread','milk','water','cheese','rice','cake'], language: ['I eat ...','I drink ...','I like ...'], practice: 'mini dialogue', review: 'likes and objects' },
    { id: 7, key: 'clothes', title: 'Clothes', goal: 'Recognize common clothing words and describe what someone wears.', vocabulary: ['shirt','dress','shoes','hat','coat','socks','jeans'], language: ['My ... is ...','I wear ...','Put on your ...'], practice: 'picture description', review: 'colors + clothes' },
    { id: 8, key: 'weather', title: 'Weather', goal: 'Recognize basic weather words and describe the day.', vocabulary: ['sunny','rainy','cloudy','windy','snowy','hot','cold'], language: ['It is ... today.'], practice: 'daily weather sentence', review: 'weather and adjectives' },
    { id: 9, key: 'school', title: 'School', goal: 'Recognize common school people and objects and talk about them.', vocabulary: ['school','teacher','student','book','pen','pencil','desk'], language: ['This is a ...','I have a ...','I go to school.'], practice: 'picture naming and speaking', review: 'school vocabulary' },
    { id: 10, key: 'transport', title: 'Transport', goal: 'Identify common vehicles and use simple transport sentences.', vocabulary: ['car','bus','train','bike','plane','boat'], language: ['I go by ...','I ride a ...','The ... can fly.'], practice: 'matching and speaking', review: 'action verbs' },
    { id: 11, key: 'nature', title: 'Nature', goal: 'Identify familiar nature words and describe simple things around us.', vocabulary: ['tree','flower','river','mountain','sun','moon','star'], language: ['I see a ...','The ... is ...'], practice: 'observation and speaking', review: 'mixed nouns and adjectives' },
    { id: 12, key: 'final-review', title: 'Final Challenge', goal: 'Combine Grade 2 vocabulary and core sentence patterns in a cumulative review.', vocabulary: [], language: ['I am ...','I have ...','I like ...','I can ...','There is ...','There are ...'], practice: 'mixed quiz, matching and sentence building', review: 'Grade 2 cumulative review' }
  ];
})();
