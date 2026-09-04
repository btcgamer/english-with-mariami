/* Grade 3 content coherence fix.
   Safe additive layer: aligns W09 vocabulary with its rainy-day quiz.
   Keeps world IDs/order, quiz structure, XP, progress and Supabase logic unchanged. */
(function(){
  'use strict';
  var c=window.GRADE3_FUTURISTIC_CONTENT;
  if(!c||!Array.isArray(c.worlds))return;
  c.worlds.forEach(function(w){
    if(w.id!=='09')return;
    w.words=[
      ['sunny','მზიანი'],
      ['rainy','წვიმიანი'],
      ['cloudy','ღრუბლიანი'],
      ['windy','ქარიანი'],
      ['snowy','თოვლიანი'],
      ['cold','ცივი'],
      ['hot','ცხელი'],
      ['spring','გაზაფხული'],
      ['umbrella','ქოლგა'],
      ['jacket','ქურთუკი']
    ];
  });
  window.GRADE3_CONTENT_COHERENCE_FIX_VERSION=1;
})();
