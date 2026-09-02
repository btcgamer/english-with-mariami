/* Grade 3 Interactive Vocabulary — practice layer only. */
(function(){
  'use strict';

  var activeMission = -1;
  var mounted = false;
  var observer = null;

  function wordsFor(index){
    var worlds = (window.GRADE3_FUTURISTIC_CONTENT && window.GRADE3_FUTURISTIC_CONTENT.worlds) || [];
    var world = worlds[index];
    if(!world || !Array.isArray(world.words)) return [];
    return world.words.map(function(pair){
      return Array.isArray(pair) ? {en:String(pair[0] || ''), ka:String(pair[1] || '')} : null;
    }).filter(function(pair){ return pair && pair.en && pair.ka; });
  }

  function speak(text){
    if(!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.88;
    window.speechSynthesis.speak(u);
  }

  function shuffle(items){
    var a = items.slice();
    for(var i=a.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var t=a[i]; a[i]=a[j]; a[j]=t;
    }
    return a;
  }

  function el(tag, cls, text){
    var node=document.createElement(tag);
    if(cls) node.className=cls;
    if(text!=null) node.textContent=text;
    return node;
  }

  function buildFlashcards(root, words){
    var section=el('section','g3i-section');
    section.appendChild(el('h3','g3i-title','🃏 FLASHCARDS'));
    var card=el('div','g3i-card');
    var en=el('div','g3i-en');
    var ka=el('div','g3i-ka');
    var count=el('div','g3i-count');
    var speakBtn=el('button','g3i-btn','🔊 SPEAK');
    var prev=el('button','g3i-btn secondary','← PREV');
    var next=el('button','g3i-btn','NEXT →');
    var controls=el('div','g3i-controls');
    var index=0;
    var flipped=false;

    function render(){
      var word=words[index];
      en.textContent=word.en;
      ka.textContent=flipped ? word.ka : 'Tap card to reveal';
      ka.classList.toggle('is-hidden',!flipped);
      count.textContent=(index+1)+' / '+words.length;
      speakBtn.onclick=function(){ speak(word.en); };
    }
    card.appendChild(en); card.appendChild(ka); card.appendChild(count);
    card.addEventListener('click',function(e){
      if(e.target===speakBtn) return;
      flipped=!flipped; render();
    });
    controls.appendChild(prev); controls.appendChild(speakBtn); controls.appendChild(next);
    prev.onclick=function(){ index=(index-1+words.length)%words.length; flipped=false; render(); };
    next.onclick=function(){ index=(index+1)%words.length; flipped=false; render(); };
    section.appendChild(card); section.appendChild(controls); root.appendChild(section);
    render();
  }

  function buildMatch(root, words){
    var section=el('section','g3i-section');
    section.appendChild(el('h3','g3i-title','🧩 MATCH WORDS'));
    var board=el('div','g3i-match');
    var feedback=el('div','g3i-feedback');
    var reset=el('button','g3i-btn','🔄 NEW ROUND');
    var selectedEn=null;
    var selectedKa=null;
    var matched=0;
    var round=shuffle(words).slice(0,Math.min(5,words.length));

    function clearSelection(){
      board.querySelectorAll('.is-selected').forEach(function(n){n.classList.remove('is-selected');});
    }
    function finishPair(enBtn,kaBtn,ok){
      if(ok){
        enBtn.classList.remove('is-selected'); kaBtn.classList.remove('is-selected');
        enBtn.classList.add('is-matched'); kaBtn.classList.add('is-matched');
        enBtn.disabled=true; kaBtn.disabled=true; matched++;
        feedback.textContent = matched===round.length ? '🎉 Great job! All pairs matched.' : '✓ Correct!';
      }else{
        feedback.textContent='Try again.';
        setTimeout(clearSelection,250);
      }
      selectedEn=null; selectedKa=null;
    }
    function pick(type,btn,word){
      if(btn.disabled) return;
      clearSelection();
      btn.classList.add('is-selected');
      if(type==='en') selectedEn={btn:btn,word:word}; else selectedKa={btn:btn,word:word};
      if(selectedEn && selectedKa){ finishPair(selectedEn.btn,selectedKa.btn,selectedEn.word.en===selectedKa.word.en); }
    }
    function render(){
      board.innerHTML=''; feedback.textContent='Match each English word with its Georgian meaning.';
      matched=0; selectedEn=null; selectedKa=null;
      var left=el('div','g3i-col'); var right=el('div','g3i-col');
      shuffle(round).forEach(function(word){
        var b=el('button','g3i-match-btn','🇬🇧 '+word.en);
        b.type='button'; b.onclick=function(){pick('en',b,word);}; left.appendChild(b);
      });
      shuffle(round).forEach(function(word){
        var b=el('button','g3i-match-btn','🇬🇪 '+word.ka);
        b.type='button'; b.onclick=function(){pick('ka',b,word);}; right.appendChild(b);
      });
      board.appendChild(left); board.appendChild(right);
    }
    reset.onclick=function(){ round=shuffle(words).slice(0,Math.min(5,words.length)); render(); };
    section.appendChild(board); section.appendChild(feedback); section.appendChild(reset); root.appendChild(section);
    render();
  }

  function mount(modal){
    if(!modal || modal.querySelector('.g3i-root')) return;
    var words=wordsFor(activeMission);
    if(!words.length) return;
    var root=el('div','g3i-root');
    root.appendChild(el('div','g3i-divider','INTERACTIVE VOCABULARY PRACTICE'));
    buildFlashcards(root,words);
    buildMatch(root,words);
    var anchor=modal.querySelector('.g3-quiz,.quiz,.g3-complete,button');
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(root,anchor);
    else modal.appendChild(root);
    mounted=true;
  }

  function watch(){
    if(observer) return;
    observer=new MutationObserver(function(){
      if(mounted) return;
      var modal=document.querySelector('.g3-vocab-modal');
      if(modal) mount(modal);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  document.addEventListener('click',function(e){
    var btn=e.target.closest && e.target.closest('.mission button');
    if(btn){
      var card=btn.closest('.mission');
      var cards=Array.prototype.slice.call(document.querySelectorAll('.mission'));
      activeMission=cards.indexOf(card);
      mounted=false;
    }
  },true);

  document.addEventListener('click',function(e){
    if(e.target.closest && e.target.closest('.g3-vocab-modal')) return;
    if(e.target.id==='start') mounted=false;
  },true);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',watch); else watch();
})();
