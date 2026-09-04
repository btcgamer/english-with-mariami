/* English with Mariami — two-color vocabulary presentation. */
(function(){
  'use strict';

  const STYLE_ID='ewm-word-neon-style';

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .words-grid .word-card .word{
        color:#f4fbff;
        text-shadow:0 0 8px rgba(255,255,255,.06);
        transition:color .22s ease,text-shadow .22s ease,filter .22s ease;
      }

      .words-grid .word-card.ewm-neon-word{
        border-color:rgba(0,234,255,.28);
        background:linear-gradient(145deg,rgba(10,39,76,.98),rgba(4,14,35,.97));
        box-shadow:inset 0 0 24px rgba(0,234,255,.035);
      }

      .words-grid .word-card.ewm-neon-word .word{
        background:linear-gradient(90deg,#00eaff 0%,#8b5cff 55%,#ff39d4 100%);
        -webkit-background-clip:text;
        background-clip:text;
        color:transparent;
        text-shadow:0 0 16px rgba(0,234,255,.22),0 0 26px rgba(139,92,255,.14);
        filter:saturate(1.15);
      }

      .words-grid .word-card.ewm-neon-word:after{
        content:"NEON";
        position:absolute;
        top:10px;
        right:10px;
        padding:4px 7px;
        border:1px solid rgba(0,234,255,.25);
        border-radius:999px;
        color:#8ffaff;
        background:rgba(0,234,255,.055);
        font:900 8px/1 Arial,sans-serif;
        letter-spacing:1px;
        box-shadow:0 0 12px rgba(0,234,255,.12);
        pointer-events:none;
      }

      .words-grid .word-card.ewm-neon-word:hover,
      .words-grid .word-card.ewm-neon-word:focus-within{
        border-color:rgba(0,234,255,.62);
        box-shadow:0 16px 40px rgba(0,0,0,.42),0 0 24px rgba(0,234,255,.12);
      }

      @media(max-width:700px){
        .words-grid .word-card.ewm-neon-word:after{font-size:7px;padding:3px 6px}
      }

      @media(prefers-reduced-motion:reduce){
        .words-grid .word-card .word{transition:none}
      }
    `;
    document.head.appendChild(style);
  }

  function markWords(){
    const cards=document.querySelectorAll('#wordsGrid .word-card');
    if(!cards.length)return false;

    cards.forEach(function(card,index){
      const data=card.dataset||{};
      const explicit=[data.neon,data.highlight,data.featured,data.special,data.isNeon].some(function(value){
        return /^(1|true|yes|neon|highlight)$/i.test(String(value||''));
      });

      /* Explicit lesson flags win. Otherwise alternate ordinary / neon for a stable visual rhythm. */
      const neon=explicit || (!explicit && index%2===1);
      card.classList.toggle('ewm-neon-word',neon);
    });
    return true;
  }

  function init(){
    installStyles();
    if(markWords())return;

    const grid=document.getElementById('wordsGrid');
    if(!grid)return;
    const observer=new MutationObserver(function(){
      if(markWords())observer.disconnect();
    });
    observer.observe(grid,{childList:true});
    window.setTimeout(function(){observer.disconnect()},10000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();