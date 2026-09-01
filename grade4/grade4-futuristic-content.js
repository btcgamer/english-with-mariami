/* Grade 4 complete curriculum fallback: 24 lessons, separated by skill/topic. */
(function(){'use strict';
const W=(word,translation,emoji)=>({word,translation,emoji});
const Q=(question,options,correct_answer)=>({question,options,correct_answer});
const worlds=[
{id:'01',title:'Grammar Core',ka:'გრამატიკის ბირთვი',icon:'🧠',lessons:[
['Present Simple','ყოველდღიური მოქმედებები','She plays football every day.',['play','თამაში','🎮'],['study','სწავლა','📚'],['walk','სიარული','🚶'],['every day','ყოველდღე','📅']],
['Do / Does Questions','კითხვები და პასუხები','Do you like English? Does she read books?',['question','კითხვა','❓'],['answer','პასუხი','💬'],['like','მოწონება','❤️'],['read','კითხვა','📖']],
['Don’t / Doesn’t','უარყოფითი წინადადებები','I don’t play chess. He doesn’t watch TV.',['don’t','არ','🚫'],['doesn’t','არ','🚫'],['watch','ყურება','📺'],['chess','ჭადრაკი','♟️']],
['There is / There are','საგნების აღწერა','There is a book. There are three pencils.',['library','ბიბლიოთეკა','📚'],['desk','მერხი','🪑'],['pencil','ფანქარი','✏️'],['classroom','საკლასო ოთახი','🏫']]]},
{id:'02',title:'Grammar Advanced',ka:'გრამატიკის შემდეგი დონე',icon:'⚙️',lessons:[
['Was / Were','Past Simple: was და were','I was at home. They were at school.',['yesterday','გუშინ','📅'],['home','სახლი','🏠'],['park','პარკი','🌳'],['happy','ბედნიერი','😊']],
['Prepositions','in, on, under, next to, between','The book is on the desk. The bag is under the chair.',['under','ქვეშ','⬇️'],['between','შორის','↔️'],['next to','გვერდით','➡️'],['behind','უკან','🔙']],
['Can / Can’t','შესაძლებლობა და უნარი','I can swim. I can’t fly.',['can','შეძლება','💪'],['cannot','არ შეუძლია','🚫'],['swim','ცურვა','🏊'],['fly','ფრენა','🪽']],
['Adjectives & Adverbs','აღწერა და მოქმედება','She is quick. She runs quickly.',['quick','სწრაფი','⚡'],['slow','ნელი','🐢'],['careful','ფრთხილი','🛡️'],['quickly','სწრაფად','💨']]]},
{id:'03',title:'Vocabulary Galaxy',ka:'თემატური სიტყვები',icon:'🔤',lessons:[
['School & Learning','სკოლა და სწავლა','At school we learn, read, write and ask questions.',['subject','საგანი','📘'],['homework','საშინაო დავალება','📝'],['lesson','გაკვეთილი','⏰'],['classmate','კლასელი','👧']],
['Daily Routine','დღის რუტინა','I wake up, have breakfast and go to school.',['wake up','გაღვიძება','🌅'],['breakfast','საუზმე','🥣'],['finish','დასრულება','🏁'],['sleep','ძილი','😴']],
['Weather & Seasons','ამინდი და სეზონები','Spring is warm. Summer is hot and sunny.',['sunny','მზიანი','☀️'],['rainy','წვიმიანი','🌧️'],['windy','ქარიანი','🌬️'],['snowy','თოვლიანი','❄️']],
['City & Travel','ქალაქი და მოგზაურობა','Use a map to find the museum and the station.',['museum','მუზეუმი','🏛️'],['station','სადგური','🚉'],['street','ქუჩა','🛣️'],['map','რუკა','🗺️']]]},
{id:'04',title:'Reading & Listening',ka:'კითხვა და მოსმენა',icon:'📖',lessons:[
['The Science Museum','მეცნიერების მუზეუმი','Luka visits a science museum and writes facts about planets in his notebook.',['planet','პლანეტა','🪐'],['museum','მუზეუმი','🏛️'],['fact','ფაქტი','💡'],['notebook','რვეული','📓']],
['The Helpful Robot','დამხმარე რობოტი','Robo carries books, checks lights and helps students find new words.',['robot','რობოტი','🤖'],['helpful','დამხმარე','🤝'],['carry','ტარება','📦'],['light','შუქი','💡']],
['Weekend Adventure','შაბათ-კვირის თავგადასავალი','Nino walks to a lake with her cousin. It rains, so they return home before dark.',['weekend','შაბათ-კვირა','🗓️'],['lake','ტბა','🏞️'],['camera','კამერა','📷'],['dark','ბნელი','🌙']],
['Future City','მომავლის ქალაქი','Electric buses are quiet. Smart lights save energy.',['future','მომავალი','🚀'],['electric','ელექტრო','⚡'],['quiet','ჩუმი','🤫'],['energy','ენერგია','🔋']]]},
{id:'05',title:'Speaking & Listening Lab',ka:'საუბარი და მოსმენა',icon:'🎧',lessons:[
['My Day','ჩემი დღე','I wake up at seven. I go to school. After school I play.',['usually','ჩვეულებრივ','⭐'],['after','შემდეგ','➡️'],['before','მანამდე','⬅️'],['together','ერთად','🤝']],
['My Opinion','ჩემი აზრი','I think English is fun because I can communicate.',['opinion','აზრი','💭'],['because','რადგან','🔗'],['prefer','არჩევა','⭐'],['interesting','საინტერესო','✨']],
['At the Shop','მაღაზიაში საუბარი','Can I have a sandwich, please? How much is it?',['shop','მაღაზია','🛍️'],['price','ფასი','💰'],['please','გთხოვთ','🙏'],['money','ფული','💵']],
['Directions','მიმართულებები','Go straight, turn right and cross the bridge.',['straight','პირდაპირ','⬆️'],['right','მარჯვნივ','➡️'],['left','მარცხნივ','⬅️'],['bridge','ხიდი','🌉']]]},
{id:'06',title:'Brain Games & Final',ka:'ქვიზები, თავსატეხები და ფინალი',icon:'🧩',lessons:[
['Grammar Quiz Arena','გრამატიკის დიდი ქვიზი','Choose the correct grammar form and explain your answer.',['correct','სწორი','✅'],['choice','არჩევანი','🎯'],['rule','წესი','📏'],['answer','პასუხი','💬']],
['Vocabulary Vault','სიტყვების საგანძური','Match words, meanings, synonyms and opposites.',['meaning','მნიშვნელობა','💡'],['synonym','სინონიმი','🪞'],['opposite','საპირისპირო','🔁'],['discover','აღმოჩენა','🔎']],
['Sentence Factory','წინადადებების თავსატეხი','Build correct sentences from mixed words.',['sentence','წინადადება','✍️'],['order','რიგი','📋'],['build','აშენება','🧱'],['solve','ამოხსნა','🧩']],
['Champion Mission','საბოლოო მისია','Read, listen, speak, solve and prove your Grade 4 skills.',['champion','ჩემპიონი','🏆'],['confidence','თავდაჯერება','💪'],['improve','გაუმჯობესება','📈'],['achieve','მიღწევა','🎯']]]}
];
const lessons=[];let n=0;
worlds.forEach((world,wi)=>world.lessons.forEach((x,li)=>{n++;const title=x[0],topic=x[1],reading=x[2],ws=x.slice(3).map(a=>W(a[0],a[1],a[2]));
let grammar_rule='',examples=[];if(wi===0||wi===1){grammar_rule=title+' — Grade 4 grammar practice. Learn the rule, read the examples, then use it in your own sentence.';examples=['Read the model sentence carefully.','Change the sentence into a question or negative when appropriate.'];}
const listening_text='Listen and repeat: '+reading+' '+reading;
const speaking_phrases=['Tell your partner about '+topic+'.','Ask one question and give one complete answer.'];
const exercises=['Read the example aloud.','Write one new sentence using today’s words.','Complete the challenge without looking at the answer.'];
let quizzes=[Q('Which answer is correct?',[reading,'I yesterday school.','Only one word.'],reading)];
if(title==='Present Simple')quizzes=[Q('She ___ English every day.',['study','studies','studying'],'studies'),Q('They ___ football.',['play','plays','playing'],'play')];
if(title==='Do / Does Questions')quizzes=[Q('___ you like books?',['Do','Does','Is'],'Do'),Q('___ she read?',['Do','Does','Are'],'Does')];
if(title==='Don’t / Doesn’t')quizzes=[Q('He ___ like milk.',['don’t','doesn’t','isn’t'],'doesn’t'),Q('We ___ play here.',['don’t','doesn’t','aren’t'],'don’t')];
if(title==='There is / There are')quizzes=[Q('___ three books.',['There is','There are','It is'],'There are'),Q('___ a desk.',['There is','There are','They are'],'There is')];
if(title==='Was / Were')quizzes=[Q('I ___ at home.',['was','were','am'],'was'),Q('They ___ happy.',['was','were','are'],'were')];
if(title==='Prepositions')quizzes=[Q('The book is ___ the desk.',['on','under','between'],'on'),Q('The bag is ___ the chair.',['under','on','between'],'under')];
if(title==='Can / Can’t')quizzes=[Q('I ___ swim.',['can','am','does'],'can'),Q('Birds can ___.',['fly','read','cook'],'fly')];
if(title==='Grammar Quiz Arena')quizzes=[Q('She ___ every day.',['reads','read','reading'],'reads'),Q('There ___ two books.',['is','are','was'],'are'),Q('They ___ happy yesterday.',['was','were','are'],'were')];
if(title==='Vocabulary Vault')quizzes=[Q('Opposite of hot?',['cold','fast','bright'],'cold'),Q('A trip is a…',['journey','question','answer'],'journey')];
if(title==='Sentence Factory')quizzes=[Q('Correct order?',['I read every day.','Every day read I.','Read I every.'],'I read every day.')];
if(title==='Champion Mission')quizzes=[Q('A good learner should…',['practise','give up','never try'],'practise'),Q('You improve by…',['practising','stopping','forgetting'],'practising')];
const puzzles=[
'🔐 WORD LOCK: Find three lesson words hidden in the sentence.',
'🧩 ORDER PUZZLE: Put the lesson words into the correct sentence order.',
'🧠 MEMORY CHALLENGE: Look at the words, hide them, then recall all four.',
'🚀 SPEED ROUND: Answer the quiz and say the correct sentence aloud.'
];
lessons.push({id:'g4-'+String(n).padStart(2,'0'),lesson_number:n,title,topic,grammar_rule,grammar_examples:examples,reading_text:reading,listening_text,speaking_phrases,exercises,words:ws,quizzes,puzzles});
}));
window.GRADE4_FUTURISTIC_CONTENT={version:4,worlds:worlds.map(w=>({id:w.id,title:w.title,ka:w.ka,icon:w.icon})),lessons};
})();
