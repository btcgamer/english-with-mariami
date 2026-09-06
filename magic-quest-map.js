/* English with Mariami — Magic Quest Map */
(function(){
 'use strict';
 if(!/academy\.html$/i.test(location.pathname))return;
 const worlds=[['g2','🌱','GRADE 2','Foundation'],['g3','🔮','GRADE 3','Adventure'],['g4','👑','GRADE 4','Mastery']];
 function read(g,k){const v=Number(localStorage.getItem(`grade${g}${k}`));return Number.isFinite(v)?Math.max(0,v):0}
 async function get(){let rows={};const api=window.ENGLISH_MARIAMI_PROGRESS_SYNC;if(api?.loadGrade)for(const g of [2,3,4])try{const r=await api.loadGrade(g);if(r)rows[g]=r}catch(_){}return rows}
 async function render(){const root=document.querySelector('.magic-command-center');if(!root)return;let map=root.querySelector('.magic-quest-map');if(!map){map=document.createElement('section');map.className='magic-quest-map';root.appendChild(map)}const rows=await get();
 const cards=worlds.map(([key,icon,name,sub],i)=>{const g=i+2,r=rows[g];const missions=Math.max(0,Number(r?.quiz_completed)||read(g,'QuizAttempts'));const words=Math.max(0,Number(r?.words_learned)||0);const progress=Math.min(100,Math.round((missions/60)*100));const state=progress>=100?'complete':progress>0?'active':'locked';return `<a class="magic-quest-node ${state}" href="/grade${g}/" aria-label="${name} portal, ${progress}% progress"><span class="magic-quest-orb">${icon}</span><div><b>${name}</b><small>${sub}</small></div><strong>${progress}%</strong><i style="--quest-progress:${progress}%"></i></a>`}).join('');
 map.innerHTML=`<header><div><small>MAGIC QUEST MAP</small><strong>ACADEMY JOURNEY</strong></div><span>GRADE 2 → GRADE 3 → GRADE 4</span></header><div class="magic-quest-track">${cards}</div>`;
 }
 function boot(){render();setInterval(render,15000);window.addEventListener('englishMariamiProgressUpdated',render)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
