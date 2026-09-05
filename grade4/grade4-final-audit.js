/* English with Mariami — Grade 4 runtime final audit
   Diagnostic only. It never mutates lesson data or progress.
   It audits the ACTUAL runtime lesson array after the Grade 4 expansion layer runs.
*/
(function(){
  'use strict';

  const EXPECTED_LESSONS = 60;
  const requiredArray = ['words','quizzes','exercises','speaking_phrases','grammar_examples','puzzles'];
  const requiredText = ['title','topic','reading_text','listening_text'];

  function text(v){ return String(v ?? '').trim(); }
  function arr(v){ return Array.isArray(v) ? v : []; }

  function audit(lessons){
    const list = Array.isArray(lessons) ? lessons : [];
    const issues = [];
    const ids = new Set();
    const numbers = new Set();

    if(list.length !== EXPECTED_LESSONS) issues.push(`Lesson count: expected ${EXPECTED_LESSONS}, found ${list.length}`);

    list.forEach((lesson, index)=>{
      const label = `Lesson ${index + 1}`;
      if(!lesson || typeof lesson !== 'object'){
        issues.push(`${label}: invalid lesson object`);
        return;
      }
      const id = text(lesson.id);
      const number = Number(lesson.lesson_number);
      if(!id) issues.push(`${label}: missing id`);
      else if(ids.has(id)) issues.push(`${label}: duplicate id ${id}`);
      else ids.add(id);
      if(!Number.isInteger(number)) issues.push(`${label}: invalid lesson_number`);
      else {
        if(number < 1 || number > EXPECTED_LESSONS) issues.push(`${label}: lesson_number ${number} outside 1-${EXPECTED_LESSONS}`);
        if(numbers.has(number)) issues.push(`${label}: duplicate lesson_number ${number}`);
        else numbers.add(number);
      }
      requiredText.forEach(key=>{ if(!text(lesson[key])) issues.push(`${label}: missing ${key}`); });
      requiredArray.forEach(key=>{ if(!Array.isArray(lesson[key])) issues.push(`${label}: ${key} is not an array`); });
      if(arr(lesson.words).length < 8) issues.push(`${label}: vocabulary below 8 words (${arr(lesson.words).length})`);
      if(!arr(lesson.quizzes).length) issues.push(`${label}: no quiz questions`);
      arr(lesson.quizzes).forEach((q, qi)=>{
        if(!q || typeof q !== 'object'){
          issues.push(`${label}: quiz ${qi + 1} invalid object`);
          return;
        }
        const options = arr(q.options).map(text).filter(Boolean);
        const correct = text(q.correct_answer);
        if(!text(q.question)) issues.push(`${label}: quiz ${qi + 1} missing question`);
        if(options.length < 2) issues.push(`${label}: quiz ${qi + 1} has fewer than 2 options`);
        if(!correct) issues.push(`${label}: quiz ${qi + 1} missing correct_answer`);
        else if(!options.includes(correct)) issues.push(`${label}: quiz ${qi + 1} correct_answer not present in options`);
      });
    });

    for(let n=1;n<=EXPECTED_LESSONS;n++) if(!numbers.has(n)) issues.push(`Missing lesson_number ${n}`);

    return {ok:issues.length===0,expected:EXPECTED_LESSONS,found:list.length,uniqueIds:ids.size,uniqueNumbers:numbers.size,issues};
  }

  window.ENGLISH_MARIAMI_G4_FINAL_AUDIT = {audit,EXPECTED_LESSONS};

  const previous = window.applyGrade4ContentExpansion;
  if(typeof previous === 'function'){
    window.applyGrade4ContentExpansion = function(lessons){
      const expanded = previous(lessons);
      const result = audit(expanded);
      window.ENGLISH_MARIAMI_G4_FINAL_AUDIT.lastResult = result;
      if(!result.ok) console.warn('[Grade 4 Final Audit]', result);
      else console.info('[Grade 4 Final Audit] PASS — 60/60 lesson structure is valid after expansion.', result);
      return expanded;
    };
  }
})();
