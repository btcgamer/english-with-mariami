/* Grade 4 — safe additive content expansion. */
(function(){'use strict';
const packs=[
[['routine','რუტინა','📅'],['usually','ჩვეულებრივ','⭐'],['always','ყოველთვის','🔁'],['sometimes','ზოგჯერ','🔄'],['never','არასდროს','🚫'],['often','ხშირად','✨'],['practice','ვარჯიში','🎯'],['remember','დამახსოვრება','🧠']],
[['yesterday','გუშინ','📅'],['last night','წუხელ','🌙'],['before','მანამდე','⬅️'],['after','შემდეგ','➡️'],['during','განმავლობაში','⏳'],['was','იყო','🔹'],['were','იყვნენ','🔹'],['visited','ეწვია','📍']],
[['subject','საგანი','📘'],['project','პროექტი','🧪'],['homework','საშინაო დავალება','📝'],['library','ბიბლიოთეკა','📚'],['classmate','კლასელი','👥'],['learn','სწავლა','🧠'],['practice','ვარჯიში','🎯'],['question','კითხვა','❓']],
[['research','კვლევა','🔬'],['discover','აღმოჩენა','🔎'],['experiment','ექსპერიმენტი','🧪'],['planet','პლანეტა','🪐'],['surface','ზედაპირი','🌍'],['scientist','მეცნიერი','👩‍🔬'],['fact','ფაქტი','💡'],['observe','დაკვირვება','👀']],
[['conversation','საუბარი','💬'],['repeat','გამეორება','🔁'],['pronounce','წარმოთქმა','🗣️'],['question','კითხვა','❓'],['answer','პასუხი','✅'],['opinion','აზრი','💭'],['agree','ვეთანხმები','🤝'],['disagree','არ ვეთანხმები','↔️']],
[['price','ფასი','💰'],['cheap','იაფი','🏷️'],['expensive','ძვირი','💎'],['customer','მყიდველი','🛍️'],['choose','არჩევა','🎯'],['need','საჭიროება','📌'],['would like','მსურს','🙏'],['receipt','ქვითარი','🧾']]
];
window.applyGrade4ContentExpansion=function(lessons){
  if(!Array.isArray(lessons))return lessons;
  lessons.forEach((lesson,i)=>{
    if(!lesson||typeof lesson!=='object')return;
    const words=Array.isArray(lesson.words)?lesson.words:[];
    const seen=new Set(words.map(w=>String(w&&w.word||'').trim().toLowerCase()).filter(Boolean));
    (packs[i%packs.length]||[]).forEach(([word,translation,emoji])=>{
      const key=word.toLowerCase();
      if(!seen.has(key)){words.push({word,translation,emoji});seen.add(key);}
    });
    lesson.words=words;
    lesson.exercises=Array.isArray(lesson.exercises)?lesson.exercises:[];
    lesson.exercises.push('Write one complete sentence using a new word from this lesson.');
    lesson.exercises.push('Explain the lesson idea in your own words.');
    lesson.speaking_phrases=Array.isArray(lesson.speaking_phrases)?lesson.speaking_phrases:[];
    lesson.speaking_phrases.push('Tell your partner one thing you learned in this mission.');
  });
  return lessons;
};
window.GRADE4_CONTENT_EXPANSION_READY=true;
})();
