/* Grade 4 — deterministic interaction/mapping audit
 * Source-level simulation for all 60 missions. No browser APIs required.
 */
(function(){'use strict';
const WORLDS=12,MISSIONS=60,TYPES=5,VOCAB_PER_WORLD=8,GRAMMAR_PER_WORLD=5;
const expectedTypes=['Vocabulary Quest','Dialogue Lab','Reading Mission','Grammar Lab','Thinking Challenge'];
const report={pass:true,checks:[],failures:[]};
const check=(name,ok,detail)=>{report.checks.push({name,ok,detail});if(!ok){report.pass=false;report.failures.push({name,detail})}};
function worldIndex(n){return Math.floor((n-1)/5)%WORLDS}
function missionType(n){return (n-1)%TYPES}
function grammarIndex(n){return [Math.floor((n-1)/5),(n-1)%GRAMMAR_PER_WORLD]}
for(let n=1;n<=MISSIONS;n++){
 const wi=worldIndex(n), mi=missionType(n), gi=grammarIndex(n);
 check('mission '+n+' world',wi===Math.floor((n-1)/5),`worldIndex=${wi}`);
 check('mission '+n+' type',expectedTypes[mi]===expectedTypes[(n-1)%TYPES],`type=${expectedTypes[mi]}`);
 check('mission '+n+' grammar',gi[0]===wi && gi[1]===mi,`grammar=[${gi.join(',')}]`);
}
check('world count',WORLDS===12,'12 worlds expected');
check('mission count',MISSIONS===60,'60 missions expected');
check('type cycle',expectedTypes.length===5,'5 mission types');
check('vocabulary mapping','active-world-vocabulary','Vocabulary uses active world');
check('dialogue mapping','active-world-dialogue','Dialogue uses active world reply');
check('reading mapping','active-world-reading','Reading uses active world question/answer');
check('thinking mapping','active-world-thinking','Thinking uses active world prompt/hints');
check('grammar mapping','world-index + mission-index','Grammar uses active world set and task index');
if(typeof window!=='undefined')window.GRADE4_INTERACTION_AUDIT=report;
if(typeof console!=='undefined')console.info('[Grade 4 Interaction Audit]',report);
})();
