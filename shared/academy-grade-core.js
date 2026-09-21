/* MAGIC NEON AI ACADEMY — shared interactive grade engine */
(function(){'use strict';
const grade=Number(document.body.dataset.grade||2),key=`magic-neon-grade-${grade}`;
const defaults={current:1,done:[],stars:0,streak:0};
let state=defaults;
try{
  const saved=JSON.parse(localStorage.getItem(key)||'null');
  if(saved&&typeof saved==='object')state={...defaults,...saved,done:Array.isArray(saved.done)?saved.done:[]};
  /* Deterministic fresh entry: Academy sets a session flag before redirecting.
     Consume it here, after the grade page loads, so intermediate redirects,
     referrer behavior and browser navigation cannot restore the old mission. */
  const freshKey=`magic-neon-fresh-grade-${grade}`;
  if(sessionStorage.getItem(freshKey)==='1'){
    state.current=1;
    saveFreshState();
    sessionStorage.removeItem(freshKey);
  }
}catch(e){state={...defaults};}
function saveFreshState(){try{localStorage.setItem(key,JSON.stringify(state))}catch(e){}}
const G2=[
['My World','I, you, he, she, home, school, friend, happy','Hi! My name is Mia. I am eight. I live in a small home. I like school and my friends.','What is your name? — My name is Mia. How old are you? — I am eight.','My name is Mia. I am eight years old. I live with my family. I go to school every day. I like English because it is fun.','What is the child’s name?','Mia','What do you like about your school?'],
['Family & Friends','mother, father, sister, brother, grandma, friend, kind, funny','This is my family. My mother is kind. My brother is funny.','Who is she? — She is my sister. Who is he? — He is my brother.','I have a small family. My mother is kind and my father is funny. I have one sister. We play games together at home.','Who is kind?','The mother','What makes a good friend?'],
['Daily Routines','wake, wash, eat, go, school, play, read, sleep','I wake up at seven. I wash my face and eat breakfast. Then I go to school.','What do you do in the morning? — I eat breakfast and go to school.','Every morning, Sam wakes up at seven. He washes his face, eats breakfast and goes to school. After school, he plays with friends and reads a book.','What does Sam do after school?','He plays and reads','Which part of your routine helps you feel ready?'],
['School Life','teacher, class, book, pen, desk, lesson, question, answer','Good morning! Open your book. Listen to the teacher. Work with your partner.','Can I ask a question? — Yes. What is the answer? — It is blue.','Our classroom is bright. There are desks, books and pencils. Our teacher asks questions. We listen, speak and help each other.','Who asks questions?','The teacher','How can students help each other?'],
['Food & Drinks','apple, banana, bread, milk, water, rice, egg, hungry','I am hungry. I would like an apple, please. — Here you are.','What do you want to drink? — I want water, please.','Mia is hungry after school. She eats an apple and a sandwich. She drinks water. Her brother eats rice and an egg.','What does Mia eat?','An apple and a sandwich','What is a healthy snack you enjoy?'],
['My Home','room, kitchen, bed, table, chair, door, window, garden','Welcome to my home! My room has a bed and a window.','Where is your book? — It is on the table.','My home has a kitchen, a living room and two bedrooms. My room has a bed, a desk and a window. There is a small garden outside.','How many bedrooms are in the home?','Two','What is your favorite place at home and why?'],
['Clothes','shirt, shoes, dress, hat, coat, socks, blue, clean','It is cold today. Put on your coat and hat.','What are you wearing? — I am wearing a blue shirt and clean shoes.','It is a cool morning. Leo wears a coat, blue socks and shoes. His sister wears a red dress and a hat.','What does Leo wear?','A coat, blue socks and shoes','Why do we choose different clothes for different weather?'],
['Weather','sunny, rainy, cloudy, windy, hot, cold, snow, umbrella','How is the weather? — It is rainy. Take your umbrella.','Is it hot today? — No, it is cold and windy.','Today is rainy and cool. Anna takes an umbrella to school. In the afternoon, the clouds disappear and the sun comes out.','What does Anna take?','An umbrella','What weather is best for playing outside?'],
['Animals','cat, dog, bird, fish, horse, rabbit, fast, small','Look at the rabbit! It is small and fast.','What animal do you have? — I have a dog. It is friendly.','Tom visits a farm. He sees a horse, two rabbits and a small bird. The horse is big, but the rabbits are fast.','Where does Tom go?','A farm','Which animal would you like to learn more about?'],
['Hobbies','draw, sing, dance, read, swim, ride, game, music','What do you like doing? — I like drawing and reading.','Can you swim? — Yes, I can. I swim on Saturdays.','Nina likes drawing, reading and riding her bike. On Saturday, she swims with her friends.','What does Nina do on Saturday?','She swims with her friends','Why is it good to have a hobby?'],
['My Day','morning, afternoon, evening, breakfast, lunch, homework, family, tired','What do you do in the evening? — I do my homework and have dinner.','Are you tired? — Yes, a little. I want to sleep.','In the morning, Ben has breakfast and goes to school. In the afternoon, he does homework and plays. In the evening, he eats dinner with his family and reads.','Who eats dinner with Ben?','His family','What is one thing you would change about your day?'],
['Big Review','learn, speak, listen, read, write, help, try, great','I can listen, speak, read and write in English. I try every day.','Can you help me? — Yes! Let’s learn together.','English is a journey. We learn new words, read short texts, speak with friends and ask questions. We make mistakes, try again and improve.','What do learners do when something is difficult?','They try again','What English skill will you practice next?']
];
const types=['Vocabulary Quest','Dialogue Lab','Reading Mission','Grammar Lab','Thinking Challenge'];

let dbLessonCache=new Map();

async function loadDbLesson(n){
  if(grade!==2)return null;
  if(dbLessonCache.has(n))return dbLessonCache.get(n);
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client)return null;
  try{
    const {data:lessonRow,error:lessonError}=await client
      .from('lessons')
      .select('id,lesson_number,title,topic,description,grammar_rule,grammar_examples,listening_text,speaking_phrases,reading_text,exercises')
      .eq('grade',grade)
      .eq('lesson_number',n)
      .maybeSingle();
    if(lessonError||!lessonRow)return null;
    const {data:wordRows,error:wordError}=await client
      .from('lesson_words')
      .select('word,translation,emoji,image_url,audio_url,sort_order')
      .eq('lesson_id',lessonRow.id)
      .order('sort_order',{ascending:true});
    if(wordError)return null;
    const {data:quizRows,error:quizError}=await client.from('lesson_quizzes').select('question,options,correct_answer,sort_order').eq('lesson_id',lessonRow.id).order('sort_order',{ascending:true});
    const result={...lessonRow,words:Array.isArray(wordRows)?wordRows:[],quizzes:quizError?[]:(Array.isArray(quizRows)?quizRows:[])};
    dbLessonCache.set(n,result);
    return result;
  }catch(error){
    console.warn('Grade 2 DB lesson load skipped:',error);
    return null;
  }
}


function dbWordsForLesson(words,dbWords){return dbWords.length?dbWords:words.split(', ').map(word=>({word,translation:''}));}
function installVocabularyStyles(){
  if(document.getElementById('g2-vocabulary-cards-style'))return;
  const style=document.createElement('style');
  style.id='g2-vocabulary-cards-style';
  style.textContent='.vocab{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.vocab-card{display:flex;flex-direction:column;align-items:stretch;gap:6px;padding:14px;border:1px solid rgba(0,234,255,.22);border-radius:16px;background:linear-gradient(145deg,rgba(0,234,255,.07),rgba(5,12,30,.82));color:#fff;text-align:left;cursor:pointer}.vocab-card:hover{border-color:rgba(0,234,255,.6);transform:translateY(-2px)}.vocab-en{font-size:18px;font-weight:1000;color:#8ff7ff}.vocab-ka{font-size:14px;color:#d7f7ff;min-height:20px}.vocab-pron{font-size:11px;color:#83aeb9}.vocab-audio{align-self:flex-start;margin-top:2px;font-size:11px;color:#00eaff}.vocab-source{margin:-2px 0 12px;color:#8db8c2;font-size:12px}.vocab-empty{padding:16px;border:1px dashed rgba(0,234,255,.25);border-radius:14px;color:#9fc5cf}';
  document.head.appendChild(style);
}

function renderVocabularyCards(dbWords,fallbackWords){
  const rows=Array.isArray(dbWords)&&dbWords.length?dbWords:fallbackWords.split(', ').map(word=>({word,translation:''}));
  return rows.map((item,i)=>{
    const word=String(item.word||'').trim();
    const translation=String(item.translation||'').trim();
    const audio=item.audio_url?String(item.audio_url):'';
    return '<button type="button" class="vocab-card wordbtn" data-speak="'+esc(word)+'"'+(audio?' data-audio-url="'+esc(audio)+'"':'')+'>'+
      '<span class="vocab-en">'+(i+1)+'. '+esc(word)+'</span>'+
      '<span class="vocab-ka">'+(translation?esc(translation):'ქართული თარგმანი მიუწვდომელია')+'</span>'+
      '<span class="vocab-pron">გამოთქმა: დააჭირე 🔊</span>'+
      '<span class="vocab-audio">🔊 მოსმენა</span>'+
      '</button>';
  }).join('');
}
const lesson=n=>G2[Math.floor((n-1)/5)%12];
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch(e){}}
function speak(t){if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(t))}}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
const grammarSets=[
[['I ___ happy at home.',['am','is','are'],'am'],['You ___ my friend.',['am','is','are'],'are'],['He ___ at school.',['am','is','are'],'is'],['She ___ kind.',['am','is','are'],'is'],['We ___ happy.',['am','is','are'],'are']],
[['My mother ___ kind.',['am','is','are'],'is'],['My brothers ___ funny.',['am','is','are'],'are'],['She ___ my sister.',['am','is','are'],'is'],['They ___ my friends.',['am','is','are'],'are'],['I ___ with my family.',['play','plays','playing'],'play']],
[['Sam ___ at seven.',['wake','wakes','waking'],'wakes'],['He ___ his face.',['wash','washes','washing'],'washes'],['We ___ breakfast.',['eat','eats','eating'],'eat'],['She ___ to school.',['go','goes','going'],'goes'],['They ___ after school.',['play','plays','playing'],'play']],
[['The teacher ___ questions.',['ask','asks','asking'],'asks'],['Students ___ and listen.',['speak','speaks','speaking'],'speak'],['I ___ my book.',['open','opens','opening'],'open'],['He ___ a pen.',['have','has','having'],'has'],['We ___ English.',['learn','learns','learning'],'learn']],
[['I ___ an apple.',['eat','eats','eating'],'eat'],['She ___ water.',['drink','drinks','drinking'],'drinks'],['We ___ hungry.',['am','is','are'],'are'],['He ___ rice.',['eat','eats','eating'],'eats'],['They ___ milk.',['drink','drinks','drinking'],'drink']],
[['My room ___ a window.',['have','has','having'],'has'],['There ___ a garden.',['is','are','am'],'is'],['There ___ two bedrooms.',['is','are','am'],'are'],['I ___ at home.',['am','is','are'],'am'],['We ___ in the kitchen.',['am','is','are'],'are']],
[['Leo ___ a coat.',['wear','wears','wearing'],'wears'],['His sister ___ a dress.',['wear','wears','wearing'],'wears'],['I ___ clean shoes.',['have','has','having'],'have'],['They ___ blue socks.',['wear','wears','wearing'],'wear'],['She ___ a hat.',['have','has','having'],'has']],
[['It ___ rainy.',['am','is','are'],'is'],['The clouds ___ gray.',['am','is','are'],'are'],['Anna ___ an umbrella.',['take','takes','taking'],'takes'],['We ___ outside.',['play','plays','playing'],'play'],['The sun ___ out.',['come','comes','coming'],'comes']],
[['A horse ___ big.',['am','is','are'],'is'],['Rabbits ___ fast.',['am','is','are'],'are'],['Tom ___ a farm.',['visit','visits','visiting'],'visits'],['A bird ___ small.',['am','is','are'],'is'],['They ___ animals.',['see','sees','seeing'],'see']],
[['Nina ___ drawing.',['like','likes','liking'],'likes'],['She ___ books.',['read','reads','reading'],'reads'],['They ___ bikes.',['ride','rides','riding'],'ride'],['I ___ music.',['like','likes','liking'],'like'],['He ___ on Saturdays.',['swim','swims','swimming'],'swims']],
[['Ben ___ breakfast.',['have','has','having'],'has'],['He ___ homework.',['do','does','doing'],'does'],['We ___ dinner.',['eat','eats','eating'],'eat'],['His family ___ together.',['eat','eats','eating'],'eats'],['I ___ tired.',['am','is','are'],'am']],
[['We ___ new words.',['learn','learns','learning'],'learn'],['I ___ English.',['speak','speaks','speaking'],'speak'],['They ___ books.',['read','reads','reading'],'read'],['She ___ every day.',['try','tries','trying'],'tries'],['He ___ again.',['try','tries','trying'],'tries']]
];
function missionData(n,L,db){
 const [topic,words,dialogue,reply,read,q,a,think]=L,w=words.split(', '),m=((n-1)%5)+1,wi=Math.floor((n-1)/5)%12;
 const dbRead=db?.reading_text||read,dbListen=db?.listening_text||dialogue,dbSpeak=Array.isArray(db?.speaking_phrases)?db.speaking_phrases:[],dbExercises=Array.isArray(db?.exercises)?db.exercises:[],dbGrammar=String(db?.grammar_rule||'').trim(),dbExamples=Array.isArray(db?.grammar_examples)?db.grammar_examples:[];
 if(m===1){const target=w[(n*3)%w.length],other=shuffle(w.filter(x=>x!==target)).slice(0,2);return {title:'Listening Word Quest',brief:'Listen to the word, find it, and repeat it aloud.',html:`<p class="example">🔊 Listen first. Which word did you hear?</p><button class="btn" data-speak="${esc(target)}">🔊 Play word</button><div class="choicegrid">${shuffle([target,...other]).map(x=>`<button class="btn choice" data-answer="${x===target?'right':'wrong'}">${esc(x)}</button>`).join('')}</div><div class="quizmsg"></div><p class="example">Bonus: say <b>${esc(target)}</b> aloud.</p>`,speak:target};}
 if(m===2){const correct=(dbSpeak[1]||reply).toString().trim();const opts=shuffle([correct,'I do not know.','Maybe tomorrow.']);return {title:'Dialogue Lab',brief:'Listen to the conversation and choose the best reply.',html:`<p class="dialogue">${esc(dialogue)}</p><button class="btn" data-speak="${esc(dialogue)}">🔊 Listen</button><p class="question">What is the best response?</p><div class="choicegrid">${opts.map(x=>`<button class="btn choice" data-answer="${x===correct?'right':'wrong'}">${esc(x)}</button>`).join('')}</div><div class="quizmsg"></div>`};}
 if(m===3){const facts=[q,a,dbRead].join(' '),statement=a.toLowerCase()==='mia'?'The child is named Mia.':`The text gives the answer: ${a}.`;const truth=facts.toLowerCase().includes(a.toLowerCase());return {title:'Reading Mission',brief:'Read carefully and prove that you understood the text.',html:`<p class="reading">${esc(dbRead)}</p><button class="btn" data-speak="${esc(dbRead)}">🔊 Listen to reading</button><p class="question">1. ${esc(q)}</p><div class="choicegrid">${shuffle([a,'The teacher','A different child']).map(x=>`<button class="btn choice" data-answer="${x===a?'right':'wrong'}">${esc(x)}</button>`).join('')}</div><p class="question">2. Is this statement true?</p><p class="example">“${esc(statement)}”</p><div class="choicegrid"><button class="btn choice" data-answer="${truth?'right':'wrong'}">True</button><button class="btn choice" data-answer="${truth?'wrong':'right'}">False</button></div><div class="quizmsg"></div>`};}
 if(m===4){const [sentence,opts,correct]=grammarSets[wi][(n-1)%5];return {title:'Grammar Lab',brief:'Complete the sentence. Look at the subject and choose the correct word.',html:`<p class="example"><b>${sentence}</b></p><div class="choicegrid">${shuffle(opts).map(x=>`<button class="btn choice" data-answer="${x===correct?'right':'wrong'}">${esc(x)}</button>`).join('')}</div><div class="quizmsg"></div><p class="example">Bonus: say the complete sentence aloud.</p>`};}
 const savedKey=`${key}-answer-${n}`,saved=localStorage.getItem(savedKey)||'';return {title:'Thinking Challenge',brief:'Use your own English. There is more than one good answer.',html:`<p class="question">${esc(think)}</p><textarea class="answer" placeholder="Write 2–4 English sentences...">${esc(saved)}</textarea><div class="wordhint">Try to use: ${esc(w.slice(0,4).join(' • '))}</div><button class="btn" data-save-answer>💾 Save answer</button><div class="save-msg"></div>`};
}
async function render(){const total=60,n=Math.max(1,Math.min(60,Number(state.current)||1)),d=new Set(state.done),L=lesson(n),db=await loadDbLesson(n),[fallbackTopic,words,dialogue,reply,read,q,a,think]=L,topic=db?.title||db?.topic||fallbackTopic,dbWords=db?.words||[],md=missionData(n,L);installVocabularyStyles();document.body.innerHTML=`<div class="particles"></div><div class="app"><aside class="side"><div class="brand">MAGIC NEON AI</div><div class="orb"><span>G${grade}</span></div><div class="grade">GRADE ${grade}</div><div class="progress"><i style="width:${d.size/total*100}%"></i></div><div class="pct">${Math.round(d.size/total*100)}% COMPLETE</div><div class="missions">${G2.map((x,i)=>{let s=i*5+1,ok=[0,1,2,3,4].every(k=>d.has(s+k));return `<button class="world ${n>=s&&n<s+5?'active':''}" data-m="${s}">🪐 ${i+1}. ${esc(x[0])} ${ok?'✓':''}</button>`}).join('')}</div></aside><main><div class="top"><div><div class="eyebrow">MAGIC NEON AI ACADEMY • GRADE ${grade}</div><div class="title">${esc(topic)}</div><div class="eyebrow">${types[(n-1)%5]} • MISSION ${n}/60</div></div><div class="stats"><span class="chip">⚡ ${d.size*10} XP</span><span class="chip">⭐ ${state.stars||0}</span><span class="chip">🔥 ${state.streak||0}</span></div></div><div class="hero card"><div class="robot">🤖</div><div><h2>AI Companion</h2><p>${esc(md.brief)}</p></div></div><div class="card"><h2>🚀 Mission ${n} • ${esc(md.title)}</h2><p>Every mission has a different task. Learn vocabulary, grammar, listening, speaking, reading, writing and exercises — then use the quiz as assessment.</p></div><div class="grid"><section class="card activity"><h2>🧠 Vocabulary Vault</h2><p class="vocab-source">${dbWords.length?`Supabase • ${dbWords.length} სასწავლო სიტყვა`:'სასწავლო სიტყვები'}</p><div class="vocab">${renderVocabularyCards(dbWords,words)}</div></section><section class="card activity"><h2>💬 Dialogue Lab</h2><p class="dialogue">${esc(dbSpeak.length?dbSpeak.join(' • '):dialogue)}</p><p class="dialogue reply">${esc(reply)}</p><button class="btn" data-speak="${esc(dbSpeak.length?dbSpeak.join(' '):dialogue+' '+reply)}">🔊 Listen</button></section><section class="card activity mission-task"><h2>🎮 Your Mission</h2>${md.html}</section><section class="card activity"><h2>📖 Reading Zone</h2><p class="reading">${esc(read)}</p><button class="btn" data-speak="${esc(read)}">🔊 Listen to reading</button></section><section class="card activity"><h2>🎯 Comprehension</h2><p class="question">${esc(q)}</p><div class="choicegrid">${shuffle([a,'The answer is not in the text.','Something different']).map(x=>`<button class="btn choice" data-answer="${x===a?'right':'wrong'}">${esc(x)}</button>`).join('')}</div><div class="quizmsg"></div></section><section class="card activity"><h2>💡 Critical Thinking</h2><p class="question">${esc(think)}</p><p class="example">Think in English. Try a complete sentence.</p></section></div><div class="card footer"><div class="btns"><button class="btn" data-prev ${n===1?'disabled':''}>← Previous</button><button class="btn primary" data-complete>✓ Complete Mission +10 XP</button><button class="btn" data-next ${n===60?'disabled':''}>Next →</button></div></div></main></div><div class="toast"></div>`;bind()}
function bind(){document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{state.current=+b.dataset.m;save();render()});document.querySelector('[data-prev]')?.addEventListener('click',()=>{state.current=Math.max(1,state.current-1);save();render()});document.querySelector('[data-next]')?.addEventListener('click',()=>{state.current=Math.min(60,state.current+1);save();render()});document.querySelector('[data-complete]')?.addEventListener('click',()=>{if(!state.done.includes(state.current)){state.done.push(state.current);state.stars=(state.stars||0)+1;state.streak=(state.streak||0)+1}if(state.current<60)state.current++;save();render()});document.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speak(b.dataset.speak));document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{const box=b.closest('.activity')||b.parentElement,msg=box.querySelector('.quizmsg')||document.querySelector('.quizmsg');msg.textContent=b.dataset.answer==='right'?'✅ Correct! Great job.':'🔁 Try again — read and listen carefully.'});document.querySelector('[data-save-answer]')?.addEventListener('click',()=>{const input=document.querySelector('.answer');try{localStorage.setItem(`${key}-answer-${state.current}`,input.value)}catch(e){}document.querySelector('.save-msg').textContent='✅ Saved on this device.'})}
window.addEventListener('DOMContentLoaded',()=>{render();});
})();