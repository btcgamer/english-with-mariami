/* English With Mariami — Learning Lab.
   This module is intentionally separate from grade lesson engines, XP, Auth and Supabase writes. */
(function(){
  'use strict';
  const grade = document.body.classList.contains('u-grade2') ? 2 : document.body.classList.contains('u-grade3') ? 3 : document.body.classList.contains('u-grade4') ? 4 : 0;
  if(!grade) return;

  const DATA = {
    2:{
      level:'Beginner',
      intro:'მოკლე ტექსტები, მარტივი დიალოგები, წინადადებები და ფიქრის კითხვები.',
      texts:[
        {title:'My Name Is Nino',type:'Text',text:'Hello! My name is Nino. I am eight years old. I live with my family. I like books and drawing. Every morning I go to school with my brother.',question:'How old is Nino?',answer:'eight',blank:'Nino likes ______.',word:'drawing'},
        {title:'At School',type:'Dialogue',lines:[['Nino','Hello, Luka! Are you ready for school?'],['Luka','Yes! I have my bag and my book.'],['Nino','What is your favorite subject?'],['Luka','I like English. It is fun!']],question:'Why does Luka like English?',answer:'because it is fun',blank:'Luka has his ______.',word:'book'},
        {title:'My Little Room',type:'Description',text:'This is my room. There is a small bed near the wall. My books are on a shelf. A blue ball is under the chair. I keep my room clean.',question:'Where is the blue ball?',answer:'under the chair',blank:'The books are on a ______.',word:'shelf'},
        {title:'A Day in the Park',type:'Text',text:'Mia is in the park with her dad. She sees a dog, two birds and a red kite. The sun is warm. Mia wants to fly the kite, but the wind is too strong.',question:'Why can Mia not fly the kite?',answer:'the wind is too strong',blank:'Mia sees two ______.',word:'birds'},
        {title:'At the Shop',type:'Dialogue',lines:[['Child','Good morning. Can I have an apple, please?'],['Shopkeeper','Of course. Would you like a red or green apple?'],['Child','A green apple, please. Thank you!'],['Shopkeeper','You are welcome.']],question:'Which apple does the child choose?',answer:'a green apple',blank:'The child says ______.',word:'thank you'}
      ],
      words:['family','school','book','friend','room','chair','apple','bird','kite','happy'],
      games:['missing','choice','memory'],
      alphabet:true
    },
    3:{
      level:'Growing Explorer',
      intro:'უფრო გრძელი ტექსტები, დიალოგები, აღწერები და საკუთარი თავისა და ოჯახის შესახებ საუბარი.',
      texts:[
        {title:'About Me',type:'Personal Text',text:'My name is Luka. I am nine years old and I live in Kutaisi. I enjoy football, drawing and reading adventure stories. At school I like English because I can learn new words and talk to my friends.',question:'Why does Luka like English?',answer:'he can learn new words and talk to friends',blank:'Luka enjoys ______ and reading adventure stories.',word:'football'},
        {title:'My Family',type:'Family Text',text:'There are four people in my family: my mother, my father, my sister and me. My sister Ana is six. She loves music. My father cooks on Saturdays, and we often eat together in the evening.',question:'Who loves music?',answer:'Ana',blank:'There are ______ people in the family.',word:'four'},
        {title:'My House',type:'Description',text:'Our house has a bright kitchen, a quiet living room and two bedrooms. My favorite place is the living room because there is a comfortable sofa next to a large window. I often read there after school.',question:'Why is the living room the favorite place?',answer:'because there is a comfortable sofa next to a large window',blank:'The sofa is next to the ______.',word:'window'},
        {title:'A Picture of My Friend',type:'Picture Description',text:'Look at the picture in your imagination. This is my friend Emma. She has long brown hair and a yellow jacket. She is smiling and holding a small green bag. Behind her there is a tall tree.',question:'What color is Emma’s jacket?',answer:'yellow',blank:'Emma is holding a small green ______.',word:'bag'},
        {title:'Two New Friends',type:'Dialogue',lines:[['Mariam','Hi! What is your name?'],['Giorgi','I am Giorgi. What is your name?'],['Mariam','I am Mariam. I like music and swimming.'],['Giorgi','Nice to meet you! I like football.']],question:'What does Mariam like?',answer:'music and swimming',blank:'Giorgi likes ______.',word:'football'}
      ],
      words:['family','parents','sister','house','window','picture','jacket','hobby','football','swimming'],
      games:['missing','choice','memory'],
      alphabet:false
    },
    4:{
      level:'Confident Explorer',
      intro:'უფრო რთული ტექსტები, დიალოგები, აღწერები და ყოველდღიური/ოფიციალური წარდგენა.',
      texts:[
        {title:'Introducing Myself — Formal',type:'Formal Introduction',text:'Good morning. My name is Daniel Brown. I am ten years old and I am a student. I live in Georgia with my family. I enjoy reading, playing chess and learning languages. It is a pleasure to meet you.',question:'Which sentence is suitable for a formal introduction?',answer:'It is a pleasure to meet you',blank:'Daniel enjoys reading, chess and learning ______.',word:'languages'},
        {title:'My Family and Our Weekend',type:'Personal Text',text:'There are five people in my family. On Saturdays we usually have breakfast together. My mother enjoys gardening, my father likes cooking, and my younger brother loves building models. In the afternoon we sometimes visit our grandparents.',question:'What does the younger brother enjoy?',answer:'building models',blank:'The family sometimes visits their ______.',word:'grandparents'},
        {title:'Describing a House',type:'Description',text:'Our house is small but comfortable. The entrance opens into a bright hallway. The kitchen is opposite the living room, while my bedroom is upstairs. There is a desk beside the window where I do my homework. I like the house because every room has a special purpose.',question:'Where does the speaker do homework?',answer:'at a desk beside the window',blank:'The bedroom is ______.',word:'upstairs'},
        {title:'At the Information Desk',type:'Dialogue',lines:[['Student','Excuse me. Could you tell me where the library is?'],['Assistant','Certainly. It is on the second floor, next to the science room.'],['Student','Thank you. Is it open this afternoon?'],['Assistant','Yes, it is open until five o’clock.']],question:'Where is the library?',answer:'on the second floor next to the science room',blank:'The library is open until ______.',word:'five o’clock'},
        {title:'A Day in My Life',type:'Personal Text',text:'I usually wake up at seven o’clock. After breakfast I walk to school. In the afternoon I finish my homework before I play outside. In the evening I read for twenty minutes. I try to keep a good balance between study, play and rest.',question:'What does the speaker do before playing outside?',answer:'finishes homework',blank:'The speaker reads for ______ minutes.',word:'twenty'}
      ],
      words:['introduction','student','languages','grandparents','comfortable','purpose','library','second floor','balance','rest'],
      games:['missing','choice','memory'],
      alphabet:false
    }
  }[grade];

  function speak(text){
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='en-US'; u.rate=grade===2?.78:grade===3?.88:0.95;
    window.speechSynthesis.speak(u);
  }
  function el(tag,attrs,html){const e=document.createElement(tag);Object.keys(attrs||{}).forEach(k=>e.setAttribute(k,attrs[k]));if(html!==undefined)e.innerHTML=html;return e;}
  function linesHtml(lines){return '<div class="lab-dialogue">'+lines.map(x=>'<div class="lab-line"><b>'+x[0]+':</b>'+x[1]+'</div>').join('')+'</div>';}

  const root=el('section',{class:'learning-lab',id:'learningLab','aria-label':'Extra learning lab'});
  root.innerHTML='<div class="learning-lab-head"><div><span class="u-badge">LEARNING LAB</span><h2>Read • Listen • Think • Play</h2><p>'+DATA.intro+'</p></div><div class="lab-note">Grade '+grade+' • '+DATA.level+'</div></div><div class="learning-lab-tabs" role="tablist"></div><div class="learning-lab-content"></div>';
  const tabs=root.querySelector('.learning-lab-tabs'), content=root.querySelector('.learning-lab-content');
  const panels={};
  function addTab(id,label){const b=el('button',{class:'learning-lab-tab',type:'button',role:'tab','aria-selected':id==='texts'?'true':'false'},label);b.addEventListener('click',()=>show(id));tabs.appendChild(b);}
  ['texts','listening','practice','games'].forEach((id,i)=>addTab(id,{texts:'📖 Texts & Dialogues',listening:'🔊 Listening',practice:'✏️ Practice',games:'🎮 Mini Games'}[id]));
  if(DATA.alphabet)addTab('alphabet','🔤 Alphabet');

  function panel(id){if(!panels[id]){panels[id]=el('div',{class:'learning-lab-panel',id:'lab-'+id});content.appendChild(panels[id]);}return panels[id];}
  function show(id){Object.values(panels).forEach(p=>p.classList.remove('is-active'));tabs.querySelectorAll('.learning-lab-tab').forEach(b=>b.setAttribute('aria-selected',b.textContent.toLowerCase().includes(id==='texts'?'texts':id==='listening'?'listening':id==='practice'?'practice':id==='games'?'mini':'alphabet')?'true':'false'));panel(id).classList.add('is-active');if(!panel(id).dataset.ready)renderPanel(id);}

  function renderPanel(id){const p=panel(id);p.dataset.ready='1';
    if(id==='texts'){
      p.innerHTML='<div class="lab-grid">'+DATA.texts.map((t,i)=>'<article class="lab-card"><h3>'+(i+1)+'. '+t.title+'</h3><div class="lab-note">'+t.type+'</div>'+(t.lines?linesHtml(t.lines):'<p>'+t.text+'</p>')+'<div class="lab-actions"><button class="lab-btn" data-speak="'+encodeURIComponent(t.lines?t.lines.map(x=>x[1]).join(' '):t.text)+'">🔊 Listen</button><button class="lab-btn" data-question="'+i+'">💡 Show thinking question</button></div><div class="lab-question" id="q-'+i+'" hidden><b>Think:</b> '+t.question+'</div></article>').join('')+'</div>';
      p.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',()=>speak(decodeURIComponent(b.dataset.speak))));
      p.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>{const q=p.querySelector('#q-'+b.dataset.question);q.hidden=!q.hidden;b.textContent=q.hidden?'💡 Show thinking question':'💡 Hide question';}));
    }
    if(id==='listening'){
      p.innerHTML='<div class="lab-grid">'+DATA.texts.map((t,i)=>'<article class="lab-card"><h3>Listening '+(i+1)+': '+t.title+'</h3><p class="lab-note">Listen twice. First for the main idea, then for details.</p><button class="lab-btn" data-listen="'+i+'">▶ Play English</button><div class="lab-question"><b>After listening:</b> '+t.question+'</div><div class="lab-feedback" id="lf-'+i+'"></div><div class="lab-actions"><button class="lab-btn" data-listen-check="'+i+'">I understood it</button></div></article>').join('')+'</div>';
      p.querySelectorAll('[data-listen]').forEach(b=>b.addEventListener('click',()=>{const t=DATA.texts[b.dataset.listen];speak(t.lines?t.lines.map(x=>x[1]).join(' '):t.text);}));
      p.querySelectorAll('[data-listen-check]').forEach(b=>b.addEventListener('click',()=>{p.querySelector('#lf-'+b.dataset.listenCheck).textContent='Great! Now say one sentence about what you heard.';}));
    }
    if(id==='practice'){
      p.innerHTML='<div class="lab-grid">'+DATA.texts.map((t,i)=>'<article class="lab-card"><h3>'+t.title+' — Fill the word</h3><p>'+t.blank.replace('______','<span class="lab-blank">______</span>')+'</p><div class="lab-actions">'+[''+t.word,...DATA.words.filter(w=>w!==t.word).slice(0,2)].map(w=>'<button class="lab-btn" data-fill="'+encodeURIComponent(w)+'" data-target="'+i+'">'+w+'</button>').join('')+'</div><div class="lab-feedback" id="pf-'+i+'"></div></article>').join('')+'</div>';
      p.querySelectorAll('[data-fill]').forEach(b=>b.addEventListener('click',()=>{const i=b.dataset.target;const t=DATA.texts[i];const ok=decodeURIComponent(b.dataset.fill).toLowerCase()===t.word.toLowerCase();p.querySelector('#pf-'+i).textContent=ok?'✅ Correct!':'Try again — read the sentence carefully.';}));
    }
    if(id==='games'){
      p.innerHTML='<div class="lab-grid"><article class="lab-card lab-game"><h3>🎯 Missing Word</h3><p id="gamePrompt">Choose the word that completes the sentence.</p><div class="lab-game-options" id="gameOptions"></div><div class="lab-score" id="gameScore">Score: 0</div></article><article class="lab-card lab-game"><h3>🧠 Quick Choice</h3><p>Which word belongs to the same topic as <b>'+DATA.words[0]+'</b>?</p><div class="lab-game-options"><button class="lab-btn" data-choice="yes">'+DATA.words[1]+'</button><button class="lab-btn" data-choice="no">'+(grade===2?'banana':'window')+'</button></div><div class="lab-feedback" id="choiceFeedback"></div></article></div>';
      let score=0;let idx=0;
      function nextGame(){const t=DATA.texts[idx%DATA.texts.length];idx++;const opts=[t.word,...DATA.words.filter(w=>w!==t.word).slice(0,2)].sort(()=>Math.random()-.5);p.querySelector('#gamePrompt').textContent=t.blank;const box=p.querySelector('#gameOptions');box.innerHTML=opts.map(w=>'<button class="lab-btn" data-game-word="'+encodeURIComponent(w)+'">'+w+'</button>').join('');box.querySelectorAll('[data-game-word]').forEach(b=>b.addEventListener('click',()=>{if(decodeURIComponent(b.dataset.gameWord)===t.word){score++;p.querySelector('#gameScore').textContent='Score: '+score+' ⭐';}nextGame();}));}
      nextGame();p.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{p.querySelector('#choiceFeedback').textContent=b.dataset.choice==='yes'?'✅ Good thinking!':'Try again — think about the topic.';}));
    }
    if(id==='alphabet'){
      const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');const examples=['apple','ball','cat','dog','elephant','fish','grape','house','ice cream','juice','kite','lion','moon','nose','orange','pen','queen','rabbit','sun','tree','umbrella','van','water','xylophone','yellow','zebra'];
      p.innerHTML='<p class="lab-note">Grade 2 only: listen to each letter and its example word.</p><div class="lab-alphabet">'+letters.map((l,i)=>'<div class="lab-letter"><b>'+l+'</b><span>'+examples[i]+'</span><button class="lab-btn" data-letter="'+l+'">🔊</button></div>').join('')+'</div><div class="lab-card" style="margin-top:14px"><h3>🔤 Alphabet Challenge</h3><p>Which letter starts the word <b id="alphaWord"></b>?</p><div class="lab-game-options" id="alphaOptions"></div><div class="lab-feedback" id="alphaFeedback"></div></div>';
      p.querySelectorAll('[data-letter]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.letter+' as in '+examples[letters.indexOf(b.dataset.letter)])));
      let ai=0;function alpha(){const word=examples[ai%examples.length],correct=letters[ai%letters.length];p.querySelector('#alphaWord').textContent=word;const opts=[correct,letters[(ai+3)%26],letters[(ai+7)%26]].sort(()=>Math.random()-.5);p.querySelector('#alphaOptions').innerHTML=opts.map(x=>'<button class="lab-btn" data-alpha="'+x+'">'+x+'</button>').join('');p.querySelectorAll('[data-alpha]').forEach(b=>b.addEventListener('click',()=>{p.querySelector('#alphaFeedback').textContent=b.dataset.alpha===correct?'✅ Correct!':'Not yet — listen and try again.';if(b.dataset.alpha===correct){ai++;setTimeout(alpha,350);}}));}alpha();
    }
  }
  document.querySelector('.g4-command')?.insertAdjacentElement('afterend',root);
  show('texts');
})();
