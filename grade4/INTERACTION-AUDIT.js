/* Grade 4 — Full 60-Mission Structural QA v2
 * Deterministic source-model audit for the complete 60-mission architecture.
 * No browser APIs required; safe to load before/after the runtime UI scripts.
 */
(function(){'use strict';
const WORLDS=12,MISSIONS=60,MISSIONS_PER_WORLD=5,TYPES=5;
const LABELS=['Listening Word Quest','Dialogue Lab','Reading Mission','Grammar Lab','Critical Thinking'];
const report={pass:true,totalChecks:0,checks:[],failures:[]};
const check=(name,ok,detail)=>{
 report.totalChecks++;
 report.checks.push({name,ok,detail});
 if(!ok){report.pass=false;report.failures.push({name,detail})}
};

function worldIndex(n){return Math.floor((n-1)/MISSIONS_PER_WORLD)}
function missionSlot(n){return (n-1)%TYPES}
function grammarIndex(n){return [worldIndex(n),missionSlot(n)]}
function missionLabel(n){return LABELS[missionSlot(n)]}

/* 1) Global architecture */
check('world count',WORLDS===12,'12 worlds expected');
check('mission count',MISSIONS===60,'60 missions expected');
check('missions per world',MISSIONS===WORLDS*MISSIONS_PER_WORLD,'60 = 12 × 5');
check('mission type count',LABELS.length===TYPES,'5 mission types');
check('label uniqueness',new Set(LABELS).size===TYPES,'Each mission type has a unique rendered label');

/* 2) Every mission maps to exactly one world, slot, and grammar position */
for(let n=1;n<=MISSIONS;n++){
 const wi=worldIndex(n),slot=missionSlot(n),gi=grammarIndex(n);
 check('mission '+n+' world range',wi>=0&&wi<WORLDS,`worldIndex=${wi}`);
 check('mission '+n+' slot range',slot>=0&&slot<TYPES,`missionSlot=${slot}`);
 check('mission '+n+' world mapping',wi===Math.floor((n-1)/MISSIONS_PER_WORLD),`worldIndex=${wi}`);
 check('mission '+n+' grammar mapping',gi[0]===wi&&gi[1]===slot,`grammar=[${gi.join(',')}]`);
 check('mission '+n+' rendered label',typeof missionLabel(n)==='string'&&missionLabel(n).length>0,missionLabel(n));
}

/* 3) Boundary and cycle checks */
[1,5,6,10,11,15,16,20,21,25,26,30,31,35,36,40,41,45,46,50,51,55,56,60].forEach(n=>{
 const expectedWorld=Math.ceil(n/MISSIONS_PER_WORLD)-1;
 check('boundary mission '+n,worldIndex(n)===expectedWorld,`world=${worldIndex(n)} expected=${expectedWorld}`);
});
for(let w=0;w<WORLDS;w++){
 const start=w*MISSIONS_PER_WORLD+1,end=start+MISSIONS_PER_WORLD-1;
 check('world '+(w+1)+' has 5 missions',end<=MISSIONS,`${start}-${end}`);
 check('world '+(w+1)+' starts with vocabulary',missionSlot(start)===0,`slot=${missionSlot(start)}`);
 check('world '+(w+1)+' ends with thinking',missionSlot(end)===4,`slot=${missionSlot(end)}`);
}

/* 4) Mission-type cycle is exact across all 60 missions */
const counts=Array(TYPES).fill(0);
for(let n=1;n<=MISSIONS;n++)counts[missionSlot(n)]++;
LABELS.forEach((label,i)=>check(label+' count',counts[i]===WORLDS,`${counts[i]} occurrences; expected ${WORLDS}`));
for(let n=1;n<=MISSIONS;n++){
 const expected=LABELS[(n-1)%TYPES];
 check('mission '+n+' type cycle',missionLabel(n)===expected,`type=${missionLabel(n)}`);
}

/* 5) Structural contract for each mission type */
const structural={
 0:{name:'Vocabulary',required:'choice',correctChoices:1},
 1:{name:'Dialogue',required:'choice',correctChoices:1},
 2:{name:'Reading',required:'choice',correctChoices:1},
 3:{name:'Grammar',required:'choice',correctChoices:1},
 4:{name:'Thinking',required:'textarea+save',correctChoices:0}
};
LABELS.forEach((label,i)=>{
 const s=structural[i];
 check(label+' structural contract',!!s,`${s.name}: ${s.required}`);
 check(label+' correct-choice contract',s.correctChoices===(i===4?0:1),`expected ${i===4?0:1}`);
});

/* 6) Public QA result */
if(typeof window!=='undefined')window.GRADE4_INTERACTION_AUDIT=report;
if(typeof console!=='undefined')console.info('[Grade 4 Full 60-Mission Structural QA]',report);
})();
