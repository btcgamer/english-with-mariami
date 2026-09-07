/* English with Mariami — Topic Isolation Layer
   Keeps the active vocabulary space aligned with the current world/lesson.
   It deliberately does not alter Grade 4 Wonderland / Guardian / Final Crown logic. */
(function(){'use strict';
const TOPICS={
2:['My World','Family & Friends','Daily Routines','School Life','Food & Drinks','My Home','Clothes','Weather','Animals','Hobbies','My Day','Big Review'],
3:['My Identity','Family Stories','Daily Life','School Projects','Food & Health','My Home & Neighborhood','Clothes & Choices','Weather & Nature','Animal World','Hobbies & Skills','A Day to Remember','Big Review'],
4:['Identity & Goals','Family & Relationships','Time & Productivity','Learning & Projects','Health & Choices','Community & Places','Style & Decisions','Climate & Environment','Animals & Science','Skills & Creativity','Experiences & Memories','Ideas & Opinions']
};
const key=g=>'magic-neon-grade-'+g;
function currentMission(g){try{const s=JSON.parse(localStorage.getItem(key(g))||'{}');return Math.max(1,Math.min(60,Number(s.current)||1))}catch(e){return 1}}
function activeTopic(g){return TOPICS[g]?.[Math.floor((currentMission(g)-1)/5)]||TOPICS[g]?.[0]||''}
function apply(){const g=Number(document.body?.dataset?.grade);if(!TOPICS[g])return;const topic=activeTopic(g);document.body.dataset.activeTopic=topic;const box=document.querySelector('.ewm-vocab-expansion');if(box){const sub=box.querySelector('.ewm-vocab-sub');if(sub)sub.textContent='Topic locked: '+topic+' • vocabulary stays inside this learning world';box.dataset.topic=topic}document.querySelectorAll('[data-topic]').forEach(el=>{if(el!==box&&el.dataset.topic&&el.dataset.topic!==topic)el.hidden=true})}
function watch(){apply();let last='';setInterval(()=>{const g=Number(document.body?.dataset?.grade),t=activeTopic(g);if(t!==last){last=t;apply()}},250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
