/* English with Mariami — Academy grade card layout fix. */
(function(){
  'use strict';
  if(!/\/academy\.html(?:$|[?#])/i.test(location.pathname+location.search+location.hash)) return;

  const clean=s=>(s||'').replace(/\s+/g,' ').trim().toLowerCase();
  const isGradeLink=el=>{
    if(!el||el.nodeType!==1||el.tagName!=='A') return false;
    const href=(el.getAttribute('href')||'').toLowerCase();
    const label=clean(el.textContent);
    return /(?:^|[\/#._-])grade[234](?:\.html|\/|$)/.test(href) || /grade\s*[234]/.test(label);
  };

  /* A grade opened from Academy is a fresh grade selection. Reset only the
     transient lesson pointer; completed missions/stars/streak remain intact. */
  function prepareFreshGradeEntry(el){
    try{
      const href=el.getAttribute('href')||'';
      const match=href.match(/(?:^|[\/#._-])grade([234])(?:\.html|\/|$)/i);
      if(!match) return;
      const grade=Number(match[1]);
      const key=`magic-neon-grade-${grade}`;
      const saved=JSON.parse(localStorage.getItem(key)||'null');
      if(saved&&typeof saved==='object'){
        saved.current=1;
        localStorage.setItem(key,JSON.stringify(saved));
      }
      sessionStorage.setItem(`magic-neon-fresh-grade-${grade}`,'1');
    }catch(e){}
  }

  /* Capture before any other Academy click handler so every Grade 2/3/4
     entry gets the same deterministic fresh-entry behavior. */
  document.addEventListener('click',function(event){
    const link=event.target.closest&&event.target.closest('a');
    if(link&&isGradeLink(link)) prepareFreshGradeEntry(link);
  },true);

  function findLearningBlock(){
    const nodes=[...document.querySelectorAll('h1,h2,h3,h4,p,a,button,[role="button"]')];
    const hit=nodes.find(el=>/დავიწყოთ\s*სწავლა|start\s*learning|begin\s*learning/i.test(clean(el.textContent)));
    if(!hit) return null;
    return hit.closest('section,.section,.hero,article') || hit.parentElement;
  }

  function move(){
    const links=[...document.querySelectorAll('a')].filter(isGradeLink);
    const magic=document.querySelector('.magic-academy-portals');
    const items=[...links];
    if(magic&&!items.includes(magic)) items.push(magic);
    if(!items.length) return;

    let block=document.getElementById('academy-grade-selection');
    if(!block){
      block=document.createElement('section');
      block.id='academy-grade-selection';
      block.setAttribute('aria-label','Grade selection');
      block.innerHTML='<div class="academy-grade-selection-title">CHOOSE YOUR GRADE</div>';
      const target=findLearningBlock();
      if(target&&target.parentNode) target.parentNode.insertBefore(block,target.nextSibling);
      else document.body.appendChild(block);
    }

    items.forEach(el=>{
      if(!el||el===block||block.contains(el)) return;
      block.appendChild(el);
    });

    const style=document.getElementById('academy-grade-selection-style')||document.createElement('style');
    style.id='academy-grade-selection-style';
    style.textContent=`
      #academy-grade-selection{position:relative;z-index:30;width:min(1100px,calc(100% - 28px));margin:34px auto 90px;padding:24px 12px 34px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px;text-align:center;border-top:1px solid rgba(0,234,255,.22)}
      #academy-grade-selection .academy-grade-selection-title{width:100%;margin-bottom:4px;color:#bdebf7;font:900 12px/1 Arial,sans-serif;letter-spacing:2px;text-shadow:0 0 12px rgba(0,234,255,.65)}
      #academy-grade-selection>a{position:static!important;display:inline-flex!important;float:none!important;margin:0!important;transform:none}
      #academy-grade-selection .magic-academy-portals{position:static!important;inset:auto!important;width:100%;display:flex!important;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;order:2}
      #academy-grade-selection .magic-grade-portal{position:relative!important;transform:none}
      @media(max-width:800px){#academy-grade-selection{width:96%;margin:26px auto 60px;padding:20px 6px 28px;gap:8px}#academy-grade-selection .magic-academy-portals{width:100%}#academy-grade-selection .magic-grade-portal{width:30vw;min-width:96px}}
    `;
    if(!style.parentNode) document.head.appendChild(style);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',move,{once:true});
  else move();
  new MutationObserver(move).observe(document.body,{childList:true,subtree:true});
})();
