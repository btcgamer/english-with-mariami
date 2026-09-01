/* English with Mariami — Grade 4 content audit
   Diagnostic only. It never changes lesson data, progress, auth, or quiz state.
*/
(function(){
  'use strict';
  const source=window.GRADE4_FUTURISTIC_CONTENT;
  const map=window.GRADE4_CURRICULUM_MAP||[];
  function norm(v){return String(v||'').trim().toLowerCase();}
  function audit(){
    const lessons=(source&&Array.isArray(source.lessons))?source.lessons:[];
    const issues=[];
    if(!lessons.length)issues.push('Grade 4 lesson source is not loaded.');
    if(lessons.length&&lessons.length!==map.length)issues.push(`Lesson/map count mismatch: lessons=${lessons.length}, map=${map.length}`);
    lessons.forEach((lesson,i)=>{
      const m=map[i];
      const title=lesson?.title||lesson?.name||lesson?.[0];
      if(!title)issues.push(`Lesson ${i+1}: missing title`);
      if(m&&norm(title)!==norm(m.title))issues.push(`Lesson ${i+1}: title mismatch — source="${title}" map="${m.title}"`);
      if(m&&!Array.isArray(m.vocabulary))issues.push(`Lesson ${i+1}: map vocabulary missing`);
    });
    return {ok:issues.length===0,count:lessons.length,mapCount:map.length,issues};
  }
  window.ENGLISH_MARIAMI_G4_CONTENT_AUDIT={audit};
})();
