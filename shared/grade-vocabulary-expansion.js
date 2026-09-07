/* English with Mariami — topic-locked vocabulary expansion for Grades 2–4.
   Adds extra English exposure without replacing the existing curriculum or progress engine. */
(function(){'use strict';
const DATA={
2:[
['My World',['person','name','age','country','city','language','student','teacher','classmate','friend','home','school','street','town','world']],
['Family & Friends',['mother','father','parent','sister','brother','grandmother','grandfather','aunt','uncle','cousin','baby','child','family','friendship','neighbor']],
['Daily Routines',['wake','brush','wash','dress','breakfast','leave','arrive','study','practice','help','play','read','rest','dinner','sleep']],
['School Life',['classroom','lesson','subject','question','answer','notebook','pencil','eraser','ruler','backpack','desk','chair','board','homework','project']],
['Food & Drinks',['apple','orange','banana','grape','bread','cheese','rice','pasta','egg','chicken','soup','water','milk','juice','hungry']],
['My Home',['bedroom','bathroom','kitchen','hall','garden','window','door','floor','wall','table','chair','bed','lamp','shelf','clean']],
['Clothes',['shirt','trousers','dress','skirt','shoes','socks','hat','coat','jacket','boots','pocket','button','color','size','comfortable']],
['Weather',['sunny','rainy','cloudy','windy','snowy','stormy','warm','cool','hot','cold','rain','snow','cloud','wind','umbrella']],
['Animals',['cat','dog','rabbit','horse','cow','sheep','goat','bird','fish','duck','lion','tiger','elephant','monkey','butterfly']],
['Hobbies',['draw','paint','sing','dance','read','write','swim','run','cycle','cook','build','collect','travel','play','music']],
['My Day',['morning','noon','afternoon','evening','night','today','tomorrow','yesterday','breakfast','lunch','dinner','homework','game','family','tired']],
['Big Review',['learn','practice','remember','understand','speak','listen','read','write','ask','answer','choose','describe','repeat','improve','excellent']]
],
3:[
['My Identity',['introduce','personality','friendly','curious','creative','careful','brave','patient','student','citizen','country','language','interest','talent','dream']],
['Family Stories',['relative','grandparent','grandchild','cousin','relationship','respect','trust','support','tradition','memory','conversation','together','helpful','kindness','generation']],
['Daily Life',['schedule','routine','usually','often','sometimes','rarely','early','late','prepare','organize','practice','relax','finish','arrive','leave']],
['School Projects',['research','project','topic','question','source','fact','information','team','partner','plan','draft','poster','present','discover','result']],
['Food & Health',['healthy','unhealthy','nutrition','energy','vegetable','fruit','protein','breakfast','lunch','water','exercise','habit','balance','choice','wellbeing']],
['Home & Neighborhood',['apartment','building','neighborhood','library','market','hospital','station','park','playground','corner','nearby','quiet','busy','safe','community']],
['Clothes & Choices',['comfortable','formal','casual','uniform','jacket','boots','pattern','material','size','style','fashion','occasion','weather','fit','choice']],
['Weather & Nature',['forecast','temperature','season','spring','summer','autumn','winter','storm','climate','nature','environment','protect','change','cloud','sunlight']],
['Animal World',['habitat','species','wild','domestic','forest','ocean','desert','mountain','behavior','protect','endangered','survive','hunt','feed','animal']],
['Hobbies & Skills',['creative','skill','talent','instrument','guitar','piano','competition','teamwork','challenge','improve','practice','confident','design','build','perform']],
['A Day to Remember',['journey','museum','exhibition','visit','arrive','explore','discover','experience','exciting','interesting','memory','return','travel','invention','history']],
['Big Review',['communicate','compare','explain','opinion','reason','evidence','reflect','goal','progress','mistake','solution','idea','describe','discuss','improve']]
],
4:[
['Identity & Goals',['identity','strength','weakness','challenge','ambition','responsibility','confidence','future','achievement','purpose','value','priority','potential','progress','goal']],
['Family & Relationships',['relationship','tradition','respect','advice','generation','trust','supportive','memory','responsibility','communication','agreement','conflict','kindness','connection','belonging']],
['Time & Productivity',['priority','schedule','organize','deadline','routine','focus','balance','efficient','productive','task','calendar','break','plan','manage','concentration']],
['Learning & Projects',['investigate','source','evidence','collaborate','draft','revise','present','solution','research','question','analysis','feedback','method','result','conclusion']],
['Health & Choices',['nutrition','wellbeing','hydration','exercise','decision','habit','moderation','energy','sleep','strength','movement','healthy','balanced','sustainable','choice']],
['Community & Places',['community','volunteer','neighborhood','facility','public','transport','service','citizen','library','environment','local','access','responsibility','cooperation','improvement']],
['Style & Decisions',['practical','appearance','quality','material','design','occasion','preference','value','durability','purpose','compare','budget','reliable','suitable','decision']],
['Climate & Environment',['climate','environment','forecast','temperature','drought','flood','storm','season','resource','recycle','reduce','reuse','pollution','protect','sustainable']],
['Animals & Science',['habitat','species','ecosystem','adapt','behavior','endangered','evidence','observe','experiment','research','energy','organism','predator','prey','conservation']],
['Skills & Creativity',['creativity','skill','talent','instrument','technique','practice','design','compose','perform','invent','build','imagine','original','project','mastery']],
['Experiences & Memories',['experience','journey','adventure','discover','explore','reflect','memory','moment','achievement','surprise','lesson','event','opportunity','return','influence']],
['Ideas & Opinions',['opinion','argument','reason','evidence','perspective','agree','disagree','explain','compare','consider','suggest','question','conclusion','belief','solution']]
]
};
const PHRASES={2:['I am ready to learn.','Can you help me, please?','What does this word mean?','How do you spell it?','Please say it again.','I understand the question.','I do not understand yet.','Let me try again.','That is a good idea.','I like learning English.','My favorite word is...','Can I answer first?','I have a question.','Let us learn together.','Great job! Keep going!'],3:['In my opinion, ...','I agree with you.','I am not sure yet.','Can you explain that?','The text says that...','I found an important fact.','Let me give an example.','First, we need to...','After that, we can...','The main idea is...','I learned something new.','I made a mistake, but I can try again.','This is similar to...','The difference is...','My goal is to improve.'],4:['In my opinion, ...','I agree because...','I disagree because...','The evidence suggests that...','One possible solution is...','There are several reasons for this.','For example, ...','On the other hand, ...','From my perspective, ...','We should consider...','A useful strategy is...','The main advantage is...','A possible disadvantage is...','This experience taught me that...','I would recommend...']};
window.EWM_TOPIC_VOCAB=DATA;
function speak(text){if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}}
function styles(){if(document.getElementById('ewm-vocab-expansion-style'))return;const s=document.createElement('style');s.id='ewm-vocab-expansion-style';s.textContent=`
.ewm-vocab-expansion{margin:22px 0;padding:22px;border:1px solid rgba(95,220,255,.25);border-radius:22px;background:linear-gradient(135deg,rgba(8,19,42,.94),rgba(13,7,36,.92));box-shadow:0 0 28px rgba(60,210,255,.10)}
.ewm-vocab-head{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}.ewm-vocab-head h2{margin:0}.ewm-vocab-sub{opacity:.72;font-size:.9rem}.ewm-word-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:9px;margin-top:15px}.ewm-word{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border:1px solid rgba(255,255,255,.10);border-radius:13px;background:rgba(255,255,255,.035);color:inherit;font:inherit;text-align:left;cursor:pointer;transition:.18s}.ewm-word:hover{transform:translateY(-2px);border-color:rgba(100,230,255,.45);box-shadow:0 0 15px rgba(70,210,255,.12)}.ewm-word small{opacity:.55}.ewm-phrase-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:12px}.ewm-phrase{padding:10px 12px;border-left:2px solid rgba(150,100,255,.7);background:rgba(255,255,255,.025);border-radius:8px}.ewm-vocab-more{margin-top:18px;font-size:.85rem;opacity:.65}.ewm-topic-qa{margin-top:10px;font-size:.78rem;opacity:.7}
`;document.head.appendChild(s)}
function getCurrentMission(grade){try{const s=JSON.parse(localStorage.getItem('magic-neon-grade-'+grade)||'{}');return Math.max(1,Math.min(60,Number(s.current)||1))}catch(e){return 1}}
function activeGroup(grade){const groups=DATA[grade]||[];const idx=Math.floor((getCurrentMission(grade)-1)/5);return groups[idx]||groups[0]}
function renderBox(box,grade){const groups=DATA[grade]||[];const active=activeGroup(grade);const unique=[...new Set(groups.flatMap(g=>g[1]))];const vocab=active[1];box.dataset.topic=active[0];box.innerHTML=`<div class="ewm-vocab-head"><div><h2>📚 English Word Vault</h2><div class="ewm-vocab-sub">${vocab.length} topic words • Grade ${grade} • active world: ${active[0]}</div></div><button class="btn ewm-say-all" type="button">🔊 Listen to words</button></div><div class="ewm-word-grid">${vocab.map(w=>`<button class="ewm-word" type="button" data-word="${w.replace(/"/g,'&quot;')}" data-topic="${active[0]}"><span>${w}</span><small>🔊</small></button>`).join('')}</div><h3 style="margin:22px 0 0">💬 Useful English Phrases</h3><div class="ewm-phrase-grid">${PHRASES[grade].map(p=>`<button class="ewm-word ewm-phrase" type="button" data-phrase="${p.replace(/"/g,'&quot;')}">${p}<small>🔊</small></button>`).join('')}</div><div class="ewm-topic-qa">✓ Topic lock active • ${unique.length} total expansion words across Grade ${grade}</div><div class="ewm-vocab-more">Keep reading, speaking, listening, and using new words in complete sentences.</div>`}
function mount(){const grade=Number(document.body?.dataset.grade);if(!DATA[grade])return;const main=document.querySelector('main');if(!main)return;styles();let box=main.querySelector('.ewm-vocab-expansion');if(!box){box=document.createElement('section');box.className='ewm-vocab-expansion';main.appendChild(box);box.addEventListener('click',e=>{const b=e.target.closest('[data-word],[data-phrase],.ewm-say-all');if(!b)return;if(b.classList.contains('ewm-say-all')){const a=activeGroup(grade);speak([...a[1],...PHRASES[grade]].join('. '))}else speak(b.dataset.word||b.dataset.phrase)})}const topic=activeGroup(grade)[0];if(box.dataset.topic!==topic)renderBox(box,grade)}
function watch(){mount();const mo=new MutationObserver(()=>{clearTimeout(window.__ewmVocabTimer);window.__ewmVocabTimer=setTimeout(mount,40)});mo.observe(document.body,{childList:true,subtree:true});let last='';setInterval(()=>{const grade=Number(document.body?.dataset.grade);if(!DATA[grade])return;const topic=activeGroup(grade)[0];if(topic!==last){last=topic;mount()}},200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
