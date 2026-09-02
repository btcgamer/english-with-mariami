/* English with Mariami — Unified Subject Labs
   Presentation/practice layer only. Does not change lesson IDs, progress, auth or Supabase writes.
*/
(function(){
  'use strict';
  var path=location.pathname.toLowerCase();
  var match=path.match(/grade([234])/);
  if(!match)return;
  var grade=Number(match[1]);
  var DATA={
    alphabet:{icon:'🔤',title:'Alphabet Lab',intro:'Learn the English alphabet, letter sounds and simple words.',items:['A — apple','B — ball','C — cat','D — dog','E — egg','F — fish','G — goat','H — hat','I — ice','J — juice','K — kite','L — lion','M — moon','N — nose','O — orange','P — pen','Q — queen','R — rabbit','S — sun','T — tree','U — umbrella','V — van','W — water','X — box','Y — yellow','Z — zebra']},
    grammar:{icon:'🧠',title:'Grammar Lab',intro:'Choose the correct form, build sentences and fix mistakes.',items:['I am / You are','He is / She is','I have / He has','I can / I can’t','There is / There are','Do you...? / Does he...?','I don’t / He doesn’t','Was / Were','Present Simple','Prepositions','Adjectives & Adverbs']},
    speaking:{icon:'🗣️',title:'Speaking Arena',intro:'Speak in complete sentences. Read the prompt aloud and answer.',items:['What is your name?','How old are you?','What do you like?','Tell me about your family.','Describe your home.','What do you do every day?','What is the weather like?','Give simple directions.','Ask for something politely.','Give your opinion.']},
    listening:{icon:'🎧',title:'Listening Lab',intro:'Listen to English and answer the question.',items:['Listen for a name.','Listen for a number.','Listen for a color.','Listen for a family word.','Listen for an animal.','Listen for a place.','Listen for an action.','Listen for a time.','Listen for a direction.','Listen for the main idea.']},
    quiz:{icon:'🎯',title:'Mega Quiz Arena',intro:'Mixed vocabulary, grammar, reading and comprehension practice.',items:['Choose the correct word.','Choose the correct sentence.','Complete the sentence.','Find the mistake.','Match word and meaning.','Choose the correct answer.','Read and answer.','Listen and answer.','Build the sentence.','Challenge question.']}
  };
  function esc(s){return String(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function speak(text){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=grade===2?.78:grade===3?.86:.92;speechSynthesis.speak(u)}
  function grammarQuestion(n){
    var q=[
      ['Choose: She ___ happy.',['is','are','am'],0],
      ['Choose: I ___ two brothers.',['has','have','is'],1],
      ['Choose: He ___ play football.',['can','cans','is can'],0],
      ['Choose: There ___ three books.',['is','are','am'],1],
      ['Choose: ___ you like apples?',['Do','Does','Is'],0],
      ['Choose: He ___ like milk.',['don’t','doesn’t','isn’t'],1],
      ['Choose: They ___ at home yesterday.',['was','were','is'],1],
      ['Choose: The cat is ___ the chair.',['under','eat','run'],0]
    ];
    if(grade===2)return q.slice(0,4); if(grade===3)return q.slice(0,6); return q;
  }
  function openLab(type){
    var d=DATA[type], modal=document.getElementById('modal'), root=document.getElementById('modalContent');
    if(!modal||!root||!d)return;
    var html='<div class="ewm-subject-lab"><div class="modal-title">'+d.icon+' '+esc(d.title)+'</div><p class="ewm-lab-intro">'+esc(d.intro)+'</p>';
    if(type==='grammar'||type==='quiz'){
      var qs=grammarQuestion();
      html+='<div class="ewm-quiz-list">'+qs.map(function(x,i){return '<article class="ewm-q"><b>'+(i+1)+'. '+esc(x[0])+'</b><div>'+x[1].map(function(a,j){return '<button type="button" data-q="'+i+'" data-a="'+j+'">'+esc(a)+'</button>'}).join('')+'</div><small data-f="'+i+'"></small></article>'}).join('')+'</div>';
    }else{
      html+='<div class="ewm-lab-grid">'+d.items.map(function(x){return '<article><b>'+esc(x)+'</b><button type="button" data-speak="'+esc(x)+'">🔊 LISTEN</button></article>'}).join('')+'</div>';
    }
    html+='<button type="button" class="ewm-lab-close">CLOSE</button></div>';
    root.innerHTML=html;modal.setAttribute('aria-hidden','false');modal.classList.add('open');
    root.onclick=function(e){
      var s=e.target.closest('[data-speak]');if(s){speak(s.dataset.speak);return}
      var a=e.target.closest('[data-q]');if(a){var q=grammarQuestion()[Number(a.dataset.q)],ok=Number(a.dataset.a)===q[2];root.querySelector('[data-f="'+a.dataset.q+'"]').textContent=ok?'✅ Correct!':'🔄 Try again!';if(ok)speak('Correct!');return}
      if(e.target.closest('.ewm-lab-close')){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
    };
  }
  function mount(){
    var grid=document.getElementById('lessonGrid');if(!grid||document.getElementById('subjectLabsBar'))return;
    var bar=document.createElement('section');bar.id='subjectLabsBar';bar.className='ewm-subject-bar';
    bar.innerHTML='<div class="ewm-subject-title">📚 SUBJECT LABS</div>'+[['alphabet','🔤 Alphabet'],['grammar','🧠 Grammar'],['speaking','🗣️ Speaking'],['listening','🎧 Listening'],['quiz','🎯 Quizzes']].map(function(x){return '<button type="button" data-lab="'+x[0]+'">'+x[1]+'</button>'}).join('');
    grid.parentNode.insertBefore(bar,grid);
    bar.onclick=function(e){var b=e.target.closest('[data-lab]');if(b)openLab(b.dataset.lab)};
  }
  var css=document.createElement('style');css.textContent='.ewm-subject-bar{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:18px;background:rgba(5,10,25,.72);backdrop-filter:blur(14px);align-items:center}.ewm-subject-title{font-weight:900;width:100%;letter-spacing:.08em}.ewm-subject-bar button,.ewm-subject-lab button{border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:10px 13px;background:rgba(255,255,255,.07);color:inherit;font-weight:800;cursor:pointer}.ewm-subject-bar button:hover,.ewm-subject-lab button:hover{transform:translateY(-1px)}.ewm-subject-lab{padding:8px}.ewm-lab-intro{opacity:.82}.ewm-lab-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.ewm-lab-grid article,.ewm-q{padding:12px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(255,255,255,.05)}.ewm-lab-grid b{display:block;margin-bottom:10px}.ewm-lab-grid button{width:100%}.ewm-q{margin:10px 0}.ewm-q>b{display:block;margin-bottom:10px}.ewm-q div{display:flex;flex-wrap:wrap;gap:8px}.ewm-q small{display:block;margin-top:8px;font-weight:800}.ewm-lab-close{margin-top:16px;width:100%}@media(max-width:700px){.ewm-subject-bar button{flex:1;min-width:125px}.ewm-lab-grid{grid-template-columns:1fr 1fr}}';document.head.appendChild(css);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();