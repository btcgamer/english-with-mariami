/* English with Mariami — very light, local supplementary curriculum viewer.
   No network APIs, no Supabase writes, no timers, no animation frames. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const grades=window.MARIAMI_GRAMMAR_LISTENING=window.MARIAMI_GRAMMAR_LISTENING||{};
const scriptLoads=new Map();let current=null,grade=1,lessonId=null,quizIndex=0,listenIndex=0,recallIndex=0,serial=0;
const el=(tag,cls)=>{const e=document.createElement(tag);if(cls)e.className=cls;return e};
const stateKey=(kind,id)=>'mariami-grammar-listening-2026-'+kind+'-'+id;
const retrieve=(kind,id)=>{try{return localStorage.getItem(stateKey(kind,id))||''}catch{return''}};
const store=(kind,id,value)=>{try{localStorage.setItem(stateKey(kind,id),String(value));return true}catch{return false}};
const normal=v=>String(v??'').normalize('NFKC').trim().toLocaleLowerCase('en').replace(/[.,!?]+$/,'').replace(/\s+/g,' ');
const stop=()=>{if('speechSynthesis' in window)try{speechSynthesis.cancel()}catch{}};
function speak(text,slow=false){
  if(!('speechSynthesis' in window)){$('listen-feedback').textContent='ამ ბრაუზერს ხმოვანი წაკითხვა არ აქვს.';return}
  stop();try{const u=new SpeechSynthesisUtterance(String(text));u.lang='en-GB';u.rate=slow?0.68:0.9;u.volume=1;window.speechSynthesis.speak(u)}catch{$('listen-feedback').textContent='მოსმენა ამ მოწყობილობაზე ვერ გაეშვა.'}
}
function loadGrade(n){
 if(grades[n])return Promise.resolve(grades[n].lessons);
 if(!scriptLoads.has(n)){
  scriptLoads.set(n,new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='shared/mariami-grammar-listening/grade-'+n+'.js';
   script.onload=()=>grades[n]?.lessons?.length===126?resolve(grades[n].lessons):reject(new Error('კლასის მონაცემები არასრულია.'));
   script.onerror=()=>reject(new Error('ფაილი ვერ გაიხსნა: grade-'+n+'.js. შეამოწმე, რომ ZIP-ის shared საქაღალდეც გადმოიტანე.'));
   document.head.appendChild(script);
  }));
 }
 return scriptLoads.get(n);
}
function urlUpdate(){try{const u=new URL(location.href);u.searchParams.set('grade',grade);if(lessonId)u.searchParams.set('lesson',lessonId);history.replaceState(null,'',u)}catch{}}
function listFilter(){const query=normal($('search').value);const src=grades[grade]?.lessons||[];return query?src.filter(l=>normal([l.title,l.titleKa,l.grammar,...l.words.flatMap(w=>[w.en,w.ka])].join(' ')).includes(query)):src}
function progress(){const lessons=grades[grade]?.lessons||[],done=lessons.filter(l=>retrieve('done',l.id)).length;$('gradeprogress').textContent=done+' / '+lessons.length}
function renderTopics(){
 const filtered=listFilter(),container=$('topics');container.replaceChildren();
 $('results').textContent=filtered.length+' / '+grades[grade].lessons.length+' თემა';progress();
 if(!filtered.length){$('lesson-content').hidden=true;$('loading').hidden=false;$('loading').textContent='ძიების შედეგი ვერ მოიძებნა. სცადე სხვა სიტყვა.';return}
 if(!filtered.some(l=>l.id===lessonId)){lessonId=filtered[0].id;quizIndex=0;listenIndex=0;recallIndex=0}
 for(let i=0;i<filtered.length;i++){
  const l=filtered[i],b=el('button','topic-item'),name=el('span'),en=el('span','topic-en');b.type='button';b.setAttribute('aria-current',String(l.id===lessonId));
  name.textContent=(retrieve('done',l.id)?'✓ ':'')+l.titleKa;en.textContent=l.title;b.append(name,en);
  b.onclick=()=>{stop();lessonId=l.id;quizIndex=0;listenIndex=0;recallIndex=0;renderTopics()};container.append(b)
 }
 const selected=filtered.find(l=>l.id===lessonId)||filtered[0];renderLesson(selected,filtered);
}
function normalizeTerm(value){return String(value??'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ')}
let uniqueByLesson=new Map();
function buildNoveltyMap(){
 uniqueByLesson=new Map();const seen=new Set();
 for(const item of grades[grade].lessons){
   const novelty=new Set();
   for(const w of item.words){const term=normalizeTerm(w.en);if(!seen.has(term))novelty.add(term);seen.add(term)}
   uniqueByLesson.set(item.id,novelty);
 }
}
function renderWordCards(lesson){
 const box=$('words');box.replaceChildren();
 const novelty=uniqueByLesson.get(lesson.id)||new Set();
 const onlyNew=$('only-new').checked;
 let visible=0;
 for(const word of lesson.words){
  const isNew=novelty.has(normalizeTerm(word.en));
  if(onlyNew&&!isNew)continue;
  visible++;
  const card=el('div','word-card'),name=el('b'),ka=el('span','translation'),tag=el('small','word-novelty');
  name.textContent=word.en;ka.textContent=word.ka;tag.textContent=isNew?'ახალი':'გამეორება';
  card.append(name,ka,tag,lessonWordButton(word));box.append(card)
 }
 if(!visible){const note=el('p','helper');note.textContent='ამ თემაში ყველა ბარათი უკვე ადრინდელ თემებში იყო. გამორთე „მხოლოდ პირველად“ და გაიმეორე.';box.append(note)}
 $('new-word-count').textContent='პირველად: '+novelty.size+' / '+lesson.words.length+' ბარათი';
}
function renderListeningPlus(lesson){
 const txt=String(lesson.listeningText||lesson.readingText||lesson.grammarModel||'').trim();
 const firstSentence=(txt.match(/[^.!?]+[.!?]?/)||[txt])[0].trim();
 const transcript=$('advanced-transcript');transcript.textContent=txt;transcript.hidden=true;
 $('reveal-transcript').textContent='ტექსტის ჩვენება';
 $('reveal-transcript').onclick=()=>{transcript.hidden=!transcript.hidden;$('reveal-transcript').textContent=transcript.hidden?'ტექსტის ჩვენება':'ტექსტის დამალვა'};
 $('play-passage').onclick=()=>speak(txt);
 $('play-passage-slow').onclick=()=>speak(txt,true);
 $('play-dictation').onclick=()=>speak(firstSentence,true);
 $('dictation-answer').value='';$('dictation-feedback').textContent='';
 $('dictation-check').onclick=()=>{
  const strip=s=>normal(s).replace(/[^\p{L}\p{N}\s]/gu,'').replace(/\s+/g,' ').trim();
  const correct=strip(firstSentence),answer=strip($('dictation-answer').value);
  const good=answer===correct&&answer.length>0;
  $('dictation-feedback').textContent=good?'✅ სწორად ჩაიწერა!':'🔁 სცადე ხელახლა. ტექსტის ნახვა შეგიძლია მინიშნებისთვის.';
  $('dictation-feedback').classList.toggle('warn',!good);
 };
 const audibleContains=w=>{const needle=normal(w).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();const hay=(' '+normal(txt).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ')+' ');return !!needle&&hay.includes(' '+needle+' ')};
 const audible=lesson.words.filter(w=>audibleContains(w.en));
 const candidate=audible[0]||null;
 $('audio-choice-options').replaceChildren();$('audio-choice-feedback').textContent='';
 if(!candidate){$('audio-choice-question').textContent='ამ თემაში მოსასმენი ტექსტისგან განსხვავებული ბარათებია. გამოიყენე კარნახი.';return}
 const distractors=lesson.words.filter(w=>w.en!==candidate.en&&!audibleContains(w.en)).map(w=>w.en);
 if(distractors.length<2){$('audio-choice-question').textContent='ამ ტექსტში რამდენიმე სწორი ვარიანტია; ორჭოფიანი ტესტის ნაცვლად გამოიყენე წინადადების კარნახი.';return}
 const opts=[candidate.en,...distractors.slice(0,3)];
 $('audio-choice-question').textContent='რომელი ინგლისური სიტყვა ან გამოთქმა გაიგონე მოსმენისას?';
 choicesUI($('audio-choice-options'),opts,candidate.en,$('audio-choice-feedback'),lesson.words.length+grade);
}
function lessonWordButton(word){const b=el('button');b.type='button';b.textContent='🔊 მოისმინე';b.setAttribute('aria-label','მოსმენა: '+word.en);b.onclick=()=>speak(word.en);return b}
function choicesUI(host,choices,correct,feedback,tag){
 host.replaceChildren();feedback.textContent='';feedback.classList.remove('warn');
 const order=choices.map((x,i)=>({x,k:(i*11+tag*17)%7})).sort((a,b)=>a.k-b.k).map(y=>y.x);
 order.forEach(x=>{
  const btn=el('button');btn.type='button';btn.textContent=x;
  btn.onclick=()=>{
   const right=x===correct;
   feedback.textContent=right?'✅ სწორია!':'🔁 სცადე ხელახლა.';
   feedback.classList.toggle('warn',!right);btn.classList.toggle(right?'correct':'wrong',true);
  };host.append(btn);
 });
}
function renderQuiz(lesson){const w=lesson.words[quizIndex%lesson.words.length];$('quiz-question').textContent='რას ნიშნავს „'+w.en+'“?';const others=lesson.words.filter(x=>x!==w&&x.ka!==w.ka).map(x=>x.ka);const opts=[w.ka,...others.slice((quizIndex+2)%Math.max(1,others.length)).concat(others).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3)];choicesUI($('quiz-options'),opts,w.ka,$('quiz-feedback'),quizIndex);}
function renderListenWord(lesson){$('listen-answer').value='';$('listen-feedback').textContent='';$('listen-feedback').classList.remove('warn');$('listen-word').onclick=()=>speak(lesson.words[listenIndex%lesson.words.length].en);$('check-listen').onclick=()=>{const correct=lesson.words[listenIndex%lesson.words.length].en;const ok=normal($('listen-answer').value)===normal(correct);$('listen-feedback').textContent=ok?'✅ სწორად გაიგონე!':'🔁 სცადე კიდევ ერთხელ. მინიშნება: '+correct.length+' სიმბოლო';$('listen-feedback').classList.toggle('warn',!ok)};}
function renderReadingQuiz(lesson){
 const quiz=lesson.readingQuiz;
 $('reading-question').textContent=quiz.question;
 choicesUI($('reading-options'),quiz.choices,quiz.correct,$('reading-feedback'),lesson.words.length+grade);
}
function renderSentenceQuiz(lesson){
 const raw=String(lesson.grammarModel||lesson.example).trim();
 const tokens=raw.match(/\S+/g)||[];
 let picked=[];
 const tokenHost=$('sentence-parts'),selected=$('sentence-selected'),feedback=$('sentence-feedback');
 tokenHost.replaceChildren();selected.textContent='';feedback.textContent='';
 const order=tokens.map((v,i)=>({v,i})).reverse();
 function redraw(){
   selected.textContent=picked.map(i=>tokens[i]).join(' ');
   for(const btn of tokenHost.querySelectorAll('button'))btn.disabled=picked.includes(Number(btn.dataset.index));
 }
 for(const item of order){
   const b=el('button');b.type='button';b.dataset.index=String(item.i);b.textContent=item.v;
   b.onclick=()=>{picked.push(item.i);feedback.textContent='';redraw()};tokenHost.append(b)
 }
 $('sentence-clear').onclick=()=>{picked=[];feedback.textContent='';redraw()};
 $('sentence-check').onclick=()=>{
   const ok=picked.length===tokens.length&&picked.every((i,k)=>i===k);
   feedback.textContent=ok?'✅ წინადადება სწორად ააწყვე!':'🔁 ჯერ სწორი თანმიმდევრობა სცადე.';
   feedback.classList.toggle('warn',!ok)
 };
}

function renderRecall(lesson){
  const word=lesson.words[recallIndex%lesson.words.length];
  $('recall-prompt').textContent='როგორ არის ინგლისურად: „'+word.ka+'“?';
  $('recall-answer').value='';$('recall-feedback').textContent='';
  $('recall-check').onclick=()=>{
    const ok=normal($('recall-answer').value)===normal(word.en);
    $('recall-feedback').textContent=ok?'✅ სწორია!':'🔁 სცადე ხელახლა. მინიშნება: '+word.en.length+' სიმბოლო';
    $('recall-feedback').classList.toggle('warn',!ok);
  };
  $('recall-next').onclick=()=>{recallIndex=(recallIndex+1)%lesson.words.length;renderRecall(lesson)};
}
function renderDialogue(lesson){
  const topic=lesson.title.split(':').slice(-1)[0].trim().replace(/[.!?]$/,'');
  const script=lesson.dialogue||('A: What are we learning today? B: We are learning about '+topic+'.');
  $('dialogue-en').textContent=script;
  $('dialogue-ka').textContent=lesson.dialogueKa||'მოუსმინე დიალოგს და ორივე როლი ხმამაღლა გაიმეორე.';
  $('listen-dialogue').onclick=()=>speak(script.replace(/\b[AB]:\s*/g,''));
  $('slow-dialogue').onclick=()=>speak(script.replace(/\b[AB]:\s*/g,''),true);
}

function renderLesson(l,filtered){
 current=l;urlUpdate();$('loading').hidden=true;$('lesson-content').hidden=false;$('error').hidden=true;
 $('topic-no').textContent='კლასი '+grade+' · თემა '+(grades[grade].lessons.indexOf(l)+1)+'/'+grades[grade].lessons.length;$('title-ka').textContent=l.titleKa;$('title-en').textContent=l.title;
 $('lesson-status').textContent=retrieve('done',l.id)?'✓ გამეორებულია':'შესასწავლი';
 $('word-count').textContent=l.words.length+' ბარათი';renderWordCards(l)
 $('grammar').textContent=l.grammar;$('grammar-en').textContent=l.grammarModel;$('grammar-ka').textContent=l.grammarModelKa;
 $('grammar-question').textContent=l.grammarQuiz.prompt;
 choicesUI($('grammar-options'),l.grammarQuiz.choices,l.grammarQuiz.correct,$('grammar-feedback'),grades[grade].lessons.indexOf(l));
 $('example-en').textContent=l.readingText||l.example;$('example-ka').textContent=l.readingKa||l.exampleKa;renderReadingQuiz(l);renderSentenceQuiz(l);renderDialogue(l);renderRecall(l);
 renderListeningPlus(l);$('listen-text').onclick=()=>speak(l.listeningText||l.example);$('listen-slow').onclick=()=>speak(l.listeningText||l.example,true);$('stop-audio').onclick=stop;
 $('next-listen-word').onclick=()=>{listenIndex=(listenIndex+1)%l.words.length;renderListenWord(l)};
 renderListenWord(l);
 $('next-quiz').onclick=()=>{quizIndex=(quizIndex+1)%l.words.length;renderQuiz(l)};renderQuiz(l);
 $('writing').value=retrieve('writing',l.id);$('writing-feedback').textContent='';
 $('save-writing').onclick=()=>{$('writing-feedback').textContent=store('writing',l.id,$('writing').value)?'✅ შენახულია ამ მოწყობილობაზე.':'⚠️ ბრაუზერმა შენახვა დაბლოკა.'};
 $('mark-done').onclick=()=>{store('done',l.id,new Date().toISOString());renderTopics()};
 $('next-topic').onclick=()=>{stop();const idx=filtered.findIndex(x=>x.id===l.id);lessonId=filtered[(idx+1)%filtered.length].id;quizIndex=0;listenIndex=0;recallIndex=0;renderTopics();$('lesson').scrollIntoView({block:'start',behavior:'auto'})};
 document.dispatchEvent(new CustomEvent('mariami:lesson-rendered',{detail:{grade,lesson:l}}));
}
async function chooseGrade(n,preserveQuery=false){
 if(!Number.isInteger(n)||n<1||n>12)return;
 const token=++serial;grade=n;lessonId=null;current=null;stop();$('lesson-content').hidden=true;$('loading').hidden=false;$('loading').textContent='მხოლოდ '+n+'-ე კლასის მასალა იტვირთება…';$('error').hidden=true;$('topics').replaceChildren();
 if(!preserveQuery)$('search').value='';
 try{
  await loadGrade(n);if(token!==serial)return;buildNoveltyMap();
  const wanted=new URL(location.href).searchParams.get('lesson');if(wanted&&grades[n].lessons.some(l=>l.id===wanted))lessonId=wanted;
  renderTopics();
 }catch(err){if(token!==serial)return;$('loading').hidden=true;$('error').hidden=false;$('error').textContent='ფაილის გახსნის შეცდომა: '+err.message;$('results').textContent='მონაცემები ვერ ჩაიტვირთა.'}
}
for(let g=1;g<=12;g++){const option=el('option');option.value=String(g);option.textContent='კლასი '+g;$('grade').append(option)}
$('grade').remove(0);$('grade').onchange=()=>chooseGrade(Number($('grade').value));$('search').oninput=()=>renderTopics();$('only-new').onchange=()=>{if(current)renderWordCards(current)};
$('stop-audio').onclick=stop;window.addEventListener('pagehide',stop);
const initial=new URL(location.href).searchParams.get('grade');grade=Math.max(1,Math.min(12,Number(initial)||1));$('grade').value=String(grade);chooseGrade(grade,true);
})();
