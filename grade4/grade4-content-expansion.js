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
window.applyGrade4ContentExpansion=function(lessons){
  if(!Array.isArray(lessons))return lessons;
  lessons.forEach((lesson,i)=>{
    if(!lesson||typeof lesson!=='object')return;
    normalizeQuizData(lesson);
    const words=Array.isArray(lesson.words)?lesson.words:[];
    const seen=new Set(words.map(w=>String(w&&w.word||'').trim().toLowerCase()).filter(Boolean));
    (packs[i%packs.length]||[]).forEach(([word,translation,emoji])=>{
      const key=word.toLowerCase();
      if(!seen.has(key)){words.push({word,translation,emoji});seen.add(key);}
    });
    lesson.words=words;
    lesson.exercises=Array.isArray(lesson.exercises)?lesson.exercises:[];
    const ex1='Write one complete sentence using a new word from this lesson.';
    const ex2='Explain the lesson idea in your own words.';
    if(!hasExact(lesson.exercises,ex1))lesson.exercises.push(ex1);
    if(!hasExact(lesson.exercises,ex2))lesson.exercises.push(ex2);
    lesson.speaking_phrases=Array.isArray(lesson.speaking_phrases)?lesson.speaking_phrases:[];
    const sp='Tell your partner one thing you learned in this mission.';
    if(!hasExact(lesson.speaking_phrases,sp))lesson.speaking_phrases.push(sp);
  });
  return lessons;
};
window.GRADE4_CONTENT_EXPANSION_READY=true;
})();
