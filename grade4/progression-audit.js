/* English with Mariami — Grade 4 progression audit
   Safe planning layer. Does not modify lessons, progress, auth, or quiz logic.
   Purpose: define how Grade 4 extends Grade 3 instead of merely repeating it.
*/
(function(){
  'use strict';
  window.GRADE4_PROGRESSION_AUDIT = [
    {key:'present-simple-advanced', from:'G3 Present Simple', extendsTo:'statements + questions + negatives', mastery:'accuracy in connected sentences'},
    {key:'do-does', from:'G3 questions', extendsTo:'do/does selection and short answers', mastery:'accurate Q&A'},
    {key:'dont-doesnt', from:'G3 negatives', extendsTo:'subject-sensitive negatives', mastery:'self-correction'},
    {key:'there-is-are', from:'G3 home/prepositions', extendsTo:'quantity + location descriptions', mastery:'place description'},
    {key:'was-were', from:'G3 time/past exposure', extendsTo:'past states and locations', mastery:'past-state accuracy'},
    {key:'prepositions-advanced', from:'G3 prepositions', extendsTo:'between/behind/next to and map context', mastery:'spatial accuracy'},
    {key:'can-cant', from:'G3 can/can’t', extendsTo:'ability interview and contrast', mastery:'functional speaking'},
    {key:'adjectives-adverbs', from:'G3 adjectives/adverbs', extendsTo:'form and function distinction', mastery:'sentence transformation'},
    {key:'school-learning', from:'G3 school life', extendsTo:'connected paragraph', mastery:'organized writing'},
    {key:'daily-routine', from:'G3 daily routine', extendsTo:'sequenced connected speech', mastery:'fluency'},
    {key:'weather-seasons', from:'G3 weather', extendsTo:'season + activity connection', mastery:'contextual description'},
    {key:'city-travel', from:'G3 places/directions', extendsTo:'practical travel context', mastery:'map comprehension'},
    {key:'science-museum', from:'G3 reading', extendsTo:'fact/detail extraction', mastery:'reading comprehension'},
    {key:'helpful-robot', from:'G3 story/listening', extendsTo:'context inference', mastery:'meaning from context'},
    {key:'weekend-adventure', from:'G3 narrative', extendsTo:'time + weather sequencing', mastery:'narrative order'},
    {key:'future-city', from:'G3 technology vocabulary', extendsTo:'information-focused reading', mastery:'key information'},
    {key:'my-day', from:'G3 routine speaking', extendsTo:'connectors and one-minute talk', mastery:'speaking fluency'},
    {key:'my-opinion', from:'G3 simple responses', extendsTo:'opinion + reason', mastery:'supported opinion'},
    {key:'at-the-shop', from:'G3 everyday English', extendsTo:'polite real-life dialogue', mastery:'functional interaction'},
    {key:'directions', from:'G3 places/prepositions', extendsTo:'giving and following directions', mastery:'two-way communication'},
    {key:'grammar-quiz', from:'G3 grammar review', extendsTo:'mixed selection + explanation + correction', mastery:'grammar reasoning'},
    {key:'vocabulary-vault', from:'G3 vocabulary', extendsTo:'synonyms, opposites and context meaning', mastery:'word relationships'},
    {key:'sentence-factory', from:'G3 sentence building', extendsTo:'mixed-word reconstruction', mastery:'word order'},
    {key:'champion-mission', from:'all G3 skills', extendsTo:'integrated Grade 4 assessment', mastery:'independent performance'}
  ];
})();
