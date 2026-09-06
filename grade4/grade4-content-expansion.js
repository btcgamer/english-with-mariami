/* Grade 4 — safe, idempotent additive content expansion. */
(function(){'use strict';
const packs=[
[['routine','რუტინა','📅'],['usually','ჩვეულებრივ','⭐'],['always','ყოველთვის','🔁'],['sometimes','ზოგჯერ','🔄'],['never','არასდროს','🚫'],['often','ხშირად','✨'],['practice','ვარჯიში','🎯'],['remember','დამახსოვრება','🧠']],
[['yesterday','გუშინ','📅'],['last night','წუხელ','🌙'],['before','მანამდე','⬅️'],['after','შემდეგ','➡️'],['during','განმავლობაში','⏳'],['was','იყო','🔹'],['were','იყვნენ','🔹'],['visited','ეწვია','📍']],
[['subject','საგანი','📘'],['project','პროექტი','🧪'],['homework','საშინაო დავალება','📝'],['library','ბიბლიოთეკა','📚'],['classmate','კლასელი','👥'],['learn','სწავლა','🧠'],['practice','ვარჯიში','🎯'],['question','კითხვა','❓']],
[['research','კვლევა','🔬'],['discover','აღმოჩენა','🔎'],['experiment','ექსპერიმენტი','🧪'],['planet','პლანეტა','🪐'],['surface','ზედაპირი','🌍'],['scientist','მეცნიერი','👩‍🔬'],['fact','ფაქტი','💡'],['observe','დაკვირვება','👀']],
[['conversation','საუბარი','💬'],['repeat','გამეორება','🔁'],['pronounce','წარმოთქმა','🗣️'],['question','კითხვა','❓'],['answer','პასუხი','✅'],['opinion','აზრი','💭'],['agree','ვეთანხმები','🤝'],['disagree','არ ვეთანხმები','↔️']],
[['price','ფასი','💰'],['cheap','იაფი','🏷️'],['expensive','ძვირი','💎'],['customer','მყიდველი','🛍️'],['choose','არჩევა','🎯'],['need','საჭიროება','📌'],['would like','მსურს','🙏'],['receipt','ქვითარი','🧾']]
];
function quizText(v){
  if(v==null)return '';
  if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return String(v);
  if(typeof v==='object')return String(v.text??v.label??v.option??v.value??v.answer??v.name??v.title??'');
  return '';
}
function normalizeQuizData(lesson){
  const qs=Array.isArray(lesson.quizzes)?lesson.quizzes:[];
  lesson.quizzes=qs.map(q=>{
    if(!q||typeof q!=='object')return q;
    if(Array.isArray(q.options))q.options=q.options.map(quizText).filter(Boolean);
    if(q.correct_answer&&typeof q.correct_answer==='object')q.correct_answer=quizText(q.correct_answer);
    return q;
  });
}
function hasExact(list,value){return list.some(x=>String(x??'').trim()===value);}
function ensureText(lesson,key,fallback){
  if(!String(lesson[key]??'').trim())lesson[key]=fallback;
}
function ensureArray(lesson,key){
  lesson[key]=Array.isArray(lesson[key])?lesson[key]:[];
}
window.applyGrade4ContentExpansion=function(lessons){
  if(!Array.isArray(lessons))return lessons;
  lessons.forEach((lesson,i)=>{
    if(!lesson||typeof lesson!=='object')return;
    const lessonNo=Number(lesson.lesson_number)||i+1;
    const title=String(lesson.title??('Grade 4 Mission '+lessonNo)).trim();
    const topic=String(lesson.topic??'Grade 4 English practice').trim();
    const reading=String(lesson.reading_text??('Read this Grade 4 mission passage and identify the key idea: '+title+'.')).trim();
    ensureText(lesson,'title',title||'Grade 4 Mission '+lessonNo);
    ensureText(lesson,'topic',topic||'Grade 4 English practice');
    ensureText(lesson,'reading_text',reading||'Read and understand this mission.');
    ensureText(lesson,'listening_text','Listen and repeat: '+lesson.reading_text);
    ensureArray(lesson,'words');
    ensureArray(lesson,'quizzes');
    ensureArray(lesson,'exercises');
    ensureArray(lesson,'speaking_phrases');
    ensureArray(lesson,'grammar_examples');
    ensureArray(lesson,'puzzles');
    normalizeQuizData(lesson);
    const words=lesson.words;
    const seen=new Set(words.map(w=>String(w&&w.word||'').trim().toLowerCase()).filter(Boolean));
    (packs[i%packs.length]||[]).forEach(([word,translation,emoji])=>{
      const key=word.toLowerCase();
      if(!seen.has(key)){words.push({word,translation,emoji});seen.add(key);}
    });
    const ex1='Write one complete sentence using a new word from this lesson.';
    const ex2='Explain the lesson idea in your own words.';
    if(!hasExact(lesson.exercises,ex1))lesson.exercises.push(ex1);
    if(!hasExact(lesson.exercises,ex2))lesson.exercises.push(ex2);
    const sp='Tell your partner one thing you learned in this mission.';
    if(!hasExact(lesson.speaking_phrases,sp))lesson.speaking_phrases.push(sp);
    if(!lesson.grammar_rule&&lesson.grammar_examples.length){lesson.grammar_rule='Use the examples to notice the key English pattern in this mission.';}
    if(!lesson.grammar_rule&&i<8){lesson.grammar_rule=title+' — Grade 4 grammar practice. Learn the rule, read the examples, then use it in your own sentence.';}
    if(!lesson.grammar_examples.length&&lesson.grammar_rule){lesson.grammar_examples.push('Read the model sentence carefully.','Use the pattern in one new sentence.');}
    if(!lesson.puzzles.some(x=>String(x??'').trim()))lesson.puzzles.push('Find the hidden pattern and solve the mission challenge.');
    if(!lesson.quizzes.length){
      lesson.quizzes.push({
        question:'What is the main idea of this mission?',
        options:[lesson.topic,'Only one word.','No answer is needed.'],
        correct_answer:lesson.topic
      });
    }
    lesson.quizzes=lesson.quizzes.map(q=>{
      if(!q||typeof q!=='object')return q;
      q.question=String(q.question??('Choose the correct answer for '+title+'.')).trim();
      q.options=Array.isArray(q.options)?q.options.map(quizText).filter(Boolean):[];
      if(q.options.length<2)q.options=[lesson.topic,'No answer.'];
      q.correct_answer=quizText(q.correct_answer).trim()||q.options[0];
      if(!q.options.includes(q.correct_answer))q.options[0]=q.correct_answer;
      return q;
    });
  });
  return lessons;
};
window.GRADE4_CONTENT_EXPANSION_READY=true;
})();
