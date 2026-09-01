/* English with Mariami — Grade 4 content audit
   Diagnostic only. It never changes lesson data, progress, auth, or quiz state.
   The production content file keeps its internal `worlds` array private, so this
   audit uses the verified canonical lesson titles instead of assuming a global export.
*/
(function(){
  'use strict';
  const map=window.GRADE4_CURRICULUM_MAP||[];
  const canonical=[
    'Present Simple','Do / Does Questions','Don’t / Doesn’t','There is / There are',
    'Was / Were','Prepositions','Can / Can’t','Adjectives & Adverbs',
    'School & Learning','Daily Routine','Weather & Seasons','City & Travel',
    'The Science Museum','The Helpful Robot','Weekend Adventure','Future City',
    'My Day','My Opinion','At the Shop','Directions',
    'Grammar Quiz Arena','Vocabulary Vault','Sentence Factory','Champion Mission'
  ];
  const norm=v=>String(v||'').trim().toLowerCase().replace(/[’]/g,"'");
  function audit(){
    const issues=[];
    if(!Array.isArray(map)||map.length!==canonical.length){
      issues.push(`Curriculum count mismatch: map=${Array.isArray(map)?map.length:0}, canonical=${canonical.length}`);
    }
    canonical.forEach((title,i)=>{
      const item=map[i];
      if(!item){issues.push(`Lesson ${i+1}: missing from curriculum map`);return;}
      if(norm(item.title)!==norm(title))issues.push(`Lesson ${i+1}: title mismatch — map="${item.title}" canonical="${title}"`);
      ['key','goal','practice'].forEach(k=>{if(!item[k])issues.push(`Lesson ${i+1}: missing ${k}`)});
      if(!Array.isArray(item.vocabulary))issues.push(`Lesson ${i+1}: vocabulary is not an array`);
    });
    return {ok:issues.length===0,count:canonical.length,mapCount:Array.isArray(map)?map.length:0,issues};
  }
  window.ENGLISH_MARIAMI_G4_CONTENT_AUDIT={audit};
})();
