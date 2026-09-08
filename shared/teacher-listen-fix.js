/* English with Mariami — robust teacher-mode listening controls */
(function(){
  'use strict';

  const qs = new URLSearchParams(location.search);
  const teacherView = qs.get('teacher_view') === '1' ||
    window.top !== window.self ||
    /teacher-grade[234]\.html/i.test(document.referrer || '');

  if(!teacherView) return;

  let speaking = false;

  function clean(value){
    return String(value || '')
      .replace(/^(listen|მოსმენა|🔊)\s*[:\-–—]?\s*/i,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function getText(button){
    const direct =
      button.dataset.listenText ||
      button.dataset.speech ||
      button.dataset.word ||
      button.getAttribute('data-text') ||
      button.getAttribute('aria-label');
    if(direct && clean(direct)) return clean(direct);

    const card = button.closest('.word,.phrase,.lesson,.card,[data-word]');
    if(card){
      const dataWord = card.getAttribute('data-word');
      if(dataWord && clean(dataWord)) return clean(dataWord);
      const strong = card.querySelector('strong,h3,.word strong');
      if(strong && clean(strong.textContent)) return clean(strong.textContent);
    }

    return clean(button.textContent);
  }

  function speak(text, button){
    if(!text || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)){
      return;
    }

    try{
      window.speechSynthesis.cancel();
      speaking = true;
      if(button) button.setAttribute('aria-busy','true');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      const done = function(){
        speaking = false;
        if(button) button.removeAttribute('aria-busy');
      };

      utterance.onend = done;
      utterance.onerror = done;
      utterance.onpause = function(){};
      utterance.onresume = function(){};

      window.speechSynthesis.speak(utterance);
    }catch(error){
      speaking = false;
      if(button) button.removeAttribute('aria-busy');
      console.warn('[Teacher Listen]',error);
    }
  }

  document.addEventListener('click',function(event){
    const button = event.target.closest?.('.listen,[data-listen],[data-speech],button[aria-label*="listen" i]');
    if(!button) return;

    const text = getText(button);
    if(!text) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    speak(text,button);
  },true);

  window.addEventListener('pagehide',function(){
    try{ window.speechSynthesis?.cancel(); }catch(e){}
  });
})();
