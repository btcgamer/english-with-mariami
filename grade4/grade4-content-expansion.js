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
const c=window.GRADE4_FUTURISTIC_CONTENT;if(!c||!Array.isArray(c.worlds))return;
let i=0;c.worlds.forEach(w=>{if(!Array.isArray(w.lessons))return;w.lessons.forEach(l=>{l[3]=Array.isArray(l[3])?l[3]:[];const seen=new Set(l[3].map(v=>String(v[0]||'').toLowerCase()));(packs[i%packs.length]).forEach(v=>{if(!seen.has(v[0].toLowerCase())){l[3].push(v);seen.add(v[0].toLowerCase());}});i++;});});
})();
