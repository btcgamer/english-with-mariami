/* Grade 3 Sentence Builder content coverage for legacy short-quiz worlds. */
(function(){
  'use strict';
  var content=window.GRADE3_FUTURISTIC_CONTENT;
  if(!content||!Array.isArray(content.worlds))return;
  var additions={
    '09':['It is rainy today.','I need an umbrella on a rainy day.'],
    '10':['I have two eyes.','I have got two eyes.']
  };
  content.worlds.forEach(function(w){
    if(!w||!additions[w.id]||Array.isArray(w.sentenceBuilder)&&w.sentenceBuilder.length)return;
    w.sentenceBuilder=additions[w.id].slice();
  });
})();
