/* English with Mariami — Topic Isolation + Runtime QA
   Keeps the active vocabulary space aligned with the current world/lesson.
   It never alters Grade 4 Wonderland / Guardian / Final Crown logic. */
(function(){'use strict';
const TOPICS={
2:['My World','Family & Friends','Daily Routines','School Life','Food & Drinks','My Home','Clothes','Weather','Animals','Hobbies','My Day','Big Review'],
3:['My Identity','Family Stories','Daily Life','School Projects','Food & Health','My Home & Neighborhood','Clothes & Choices','Weather & Nature','Animal World','Hobbies & Skills','A Day to Remember','Big Review'],
4:['Identity & Goals','Family & Relationships','Time & Productivity','Learning & Projects','Health & Choices','Community & Places','Style & Decisions','Climate & Environment','Animals & Science','Skills & Creativity','Experiences & Memories','Ideas & Opinions']
};
const key=g=>'magic-neon-grade-'+g;
function currentMission(g){try{const s=JSON.parse(localStorage.getItem(key(g))||'{}');return Math.max(1,Math.min(60,Number(s.current)||1))}catch(e){return 1}}
function activeTopic(g){return TOPICS[g]?.[Math.floor((currentMission(g)-1)/5)]||TOPICS[g]?.[0]||''}
function apply(){
 const g=Number(document.body?.dataset?.grade);if(!TOPICS[g])return;
 const mission=currentMission(g),idx=Math.floor((mission-1)/5),topic=activeTopic(g);
 document.body.dataset.activeTopic=topic;
 document.body.dataset.topicQa='pending';
 const box=document.querySelector('.ewm-vocab-expansion');
 if(box){
   const sub=box.querySelector('.ewm-vocab-sub');
   if(sub)sub.textContent='Topic locked: '+topic+' • vocabulary stays inside this learning world';
   box.dataset.topic=topic;
   const expected=window.EWM_TOPIC_VOCAB?.[g]?.[idx]?.[1]||[];
   const visible=[...box.querySelectorAll('[data-word]')].map(x=>x.dataset.word).filter(Boolean);
   const clean=new Set(expected.map(x=>String(x).toLowerCase()));
   const mismatches=visible.filter(x=>!clean.has(String(x).toLowerCase()));
   const qa=box.querySelector('.ewm-topic-qa');
   if(qa)qa.textContent=mismatches.length?'⚠ Topic QA: '+mismatches.length+' vocabulary mismatch(es) detected':'✓ Topic QA passed • '+visible.length+' words locked to '+topic;
   if(!mismatches.length&&visible.length===expected.length){
     document.body.dataset.topicQa='pass';
     box.dataset.topicQa='pass';
   }else if(visible.length){
     document.body.dataset.topicQa='warn';
     box.dataset.topicQa='warn';
   }
 }
 const title=(document.querySelector('.title')?.textContent||'').trim();
 if(title&&title!==topic){document.body.dataset.topicQa='warn';console.warn('[EWM Topic QA] Mission '+mission+' expected '+topic+' but page title is '+title)}
 document.querySelectorAll('[data-topic]').forEach(el=>{if(el!==box&&el.dataset.topic&&el.dataset.topic!==topic)el.hidden=true});
}
function watch(){
 let last='';
 const tick=()=>{const g=Number(document.body?.dataset?.grade);if(!TOPICS[g])return;const signature=currentMission(g)+'|'+activeTopic(g)+'|'+(document.querySelector('.ewm-vocab-expansion')?'1':'0')+'|'+(document.querySelector('.title')?.textContent||'');if(signature!==last){last=signature;apply()}};
 tick();setInterval(tick,250);
 const mo=new MutationObserver(()=>setTimeout(tick,20));
 mo.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
