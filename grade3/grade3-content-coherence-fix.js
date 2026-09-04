/* Grade 3 content coherence fix.
   Safe additive layer: aligns W09 vocabulary with its rainy-day quiz.
   Keeps world IDs/order, quiz structure, XP, progress and Supabase logic unchanged. */
(function(){
  'use strict';
  var c=window.GRADE3_FUTURISTIC_CONTENT;
  if(!c||!Array.isArray(c.worlds))return;
  function quizText(v){
    if(v==null)return '';
    if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return String(v);
    if(typeof v==='object')return String(v.text??v.label??v.option??v.value??v.answer??v.name??v.title??'');
    return '';
  }
  c.worlds.forEach(function(w){
    if(w.id==='09'){
      w.words=[
        ['sunny','მზიანი'],['rainy','წვიმიანი'],['cloudy','ღრუბლიანი'],['windy','ქარიანი'],['snowy','თოვლიანი'],
        ['cold','ცივი'],['hot','ცხელი'],['spring','გაზაფხული'],['umbrella','ქოლგა'],['jacket','ქურთუკი']
      ];
    }
    if(Array.isArray(w.quiz))w.quiz=w.quiz.map(function(q){
      if(!q||typeof q!=='object')return q;
      if(Array.isArray(q.options))q.options=q.options.map(quizText).filter(Boolean);
      if(q.answer&&typeof q.answer==='object')q.answer=quizText(q.answer);
      return q;
    });
  });
  window.GRADE3_CONTENT_COHERENCE_FIX_VERSION=2;
})();