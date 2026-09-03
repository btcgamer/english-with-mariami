/* Grade 3 Sentence Builder — practice layer only. */
(function(){
  'use strict';

  var activeMission=-1, mounted=false, observer=null;

  function sentencesFor(index){
    var worlds=(window.GRADE3_FUTURISTIC_CONTENT&&window.GRADE3_FUTURISTIC_CONTENT.worlds)||[];
    var w=worlds[index];
    if(!w) return [];
    var out=[];
    if(Array.isArray(w.sentenceBuilder)) out=w.sentenceBuilder.slice();
    if(!out.length && Array.isArray(w.quiz)){
      w.quiz.forEach(function(q){
        if(q&&typeof q==='object'&&q.answer&&typeof q.answer==='string'&&q.answer.trim().split(/\s+/).length>=3) out.push(q.answer.replace(/[.!?]+$/,''));
      });
    }
    return out.map(String).filter(function(s){return s.trim().split(/\s+/).length>=3;}).slice(0,5);
  }
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
  function mount(modal){
    if(!modal||modal.querySelector('.g3sb-root'))return;
    var sentences=sentencesFor(activeMission); if(!sentences.length)return;
    var root=el('section','g3sb-root');
    root.appendChild(el('div','g3sb-divider','SENTENCE BUILDER'));
    var target=el('div','g3sb-target','Build the sentence.');
    var bank=el('div','g3sb-bank');
    var built=el('div','g3sb-built');
    var feedback=el('div','g3sb-feedback');
    var next=el('button','g3sb-btn','NEXT SENTENCE →');
    var reset=el('button','g3sb-btn','↻ RESET');
    var check=el('button','g3sb-btn','✓ CHECK');
    var index=0, answer=[];
    function render(){
      var sentence=sentences[index];
      target.textContent='Build: '+sentence.replace(/\b\w+/g,'_____').replace(/\s+/g,' ').trim();
      bank.innerHTML='';built.innerHTML='';feedback.textContent='';answer=[];
      shuffle(sentence.split(/\s+/)).forEach(function(word,i){
        var b=el('button','g3sb-word',word);b.type='button';b.dataset.word=word;b.dataset.i=i;
        b.onclick=function(){if(b.disabled)return;answer.push(word);b.disabled=true;b.classList.add('is-used');renderBuilt();};bank.appendChild(b);
      });
    }
    function renderBuilt(){built.innerHTML='';answer.forEach(function(w){built.appendChild(el('span','g3sb-chip',w));});}
    check.onclick=function(){
      var expected=sentences[index].split(/\s+/).join(' ').toLowerCase();
      var actual=answer.join(' ').replace(/[.!?]+$/,'').toLowerCase();
      feedback.textContent=actual===expected?'🎉 Correct sentence!':'Try again — check the word order.';
      if(actual===expected) feedback.classList.add('is-correct'); else feedback.classList.remove('is-correct');
    };
    reset.onclick=function(){render();};
    next.onclick=function(){index=(index+1)%sentences.length;render();};
    root.appendChild(target);root.appendChild(bank);root.appendChild(el('div','g3sb-label','YOUR SENTENCE'));root.appendChild(built);root.appendChild(feedback);
    var controls=el('div','g3sb-controls');controls.appendChild(check);controls.appendChild(reset);controls.appendChild(next);root.appendChild(controls);
    var anchor=modal.querySelector('.g3i-root,.g3-quiz,.quiz,.g3-complete,button');
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(root,anchor);else modal.appendChild(root);
    render();mounted=true;
  }
  function watch(){if(observer)return;observer=new MutationObserver(function(){if(mounted)return;var modal=document.querySelector('.g3-vocab-modal');if(modal)mount(modal);});observer.observe(document.body,{childList:true,subtree:true});}
  document.addEventListener('click',function(e){var btn=e.target.closest&&e.target.closest('.mission button');if(btn){var card=btn.closest('.mission'),cards=Array.prototype.slice.call(document.querySelectorAll('.mission'));activeMission=cards.indexOf(card);mounted=false;}},true);
  document.addEventListener('click',function(e){if(e.target.id==='start')mounted=false;},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
