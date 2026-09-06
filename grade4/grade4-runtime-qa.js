/* Grade 4 — Runtime Interaction QA Harness v2
 * Opt-in only: run with ?qa=1. Normal learners are never affected.
 * Walks missions 1–60, validates rendered DOM contracts, answers each task,
 * verifies completion, and restores the learner's original localStorage state.
 */
(function(){'use strict';
const QA_PARAM='qa',STATE_KEY='magic-neon-grade-4',REPORT_KEY='grade4-runtime-qa-v2',SNAPSHOT_KEY='grade4-runtime-qa-snapshot-v2';
const TOTAL=60;
const LABELS=['Listening Word Quest','Dialogue Lab','Reading Mission','Grammar Lab','Critical Thinking'];
const qs=new URLSearchParams(location.search);
const mode=qs.get(QA_PARAM);
if(mode!=='1'&&mode!=='done')return;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const readJSON=(k,d)=>{try{return JSON.parse(sessionStorage.getItem(k)||'null')??d}catch(e){return d}};
const writeJSON=(k,v)=>{try{sessionStorage.setItem(k,JSON.stringify(v))}catch(e){}}
const answerFor=()=>[
 'I think this idea is useful because it gives a clear reason.',
 'It can help people learn and make a better decision.',
 'We should consider evidence and practical results before choosing.',
 'A careful approach can make the final result more effective.'
].join(' ');

function snapshot(){
 if(sessionStorage.getItem(SNAPSHOT_KEY))return;
 const items={};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(/^(magic-neon-grade-4|grade4-answer-)/.test(k)))items[k]=localStorage.getItem(k)}
 writeJSON(SNAPSHOT_KEY,items);
}
function restore(){
 const original=readJSON(SNAPSHOT_KEY,null);
 if(!original)return false;
 for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&(/^(magic-neon-grade-4|grade4-answer-)/.test(k)))localStorage.removeItem(k)}
 Object.keys(original).forEach(k=>localStorage.setItem(k,original[k]));
 return true;
}

let report=readJSON(REPORT_KEY,{startedAt:new Date().toISOString(),pass:true,missions:[],checks:0,failures:[]});
const fail=(n,detail)=>{report.pass=false;report.failures.push({mission:n,detail})};
const check=(n,ok,detail)=>{report.checks++;if(!ok)fail(n,detail)};

function currentMission(){
 const nodes=[...document.querySelectorAll('.top .eyebrow, .eyebrow')];
 const m=nodes.find(x=>/MISSION\s+\d+\s*\/\s*60/i.test(x.textContent||''));
 const match=(m?.textContent||'').match(/MISSION\s+(\d+)\s*\/\s*60/i);
 return match?Number(match[1]):null;
}
function missionTitle(){return (document.querySelector('.mission-card h2')?.textContent||'').trim()}
function runMission(n){
 const task=document.querySelector('.mission-task');
 const complete=document.querySelector('[data-complete]');
 check(n,!!task,'mission-task missing');
 check(n,!!complete,'complete button missing');
 if(!task||!complete)return false;
 const choices=[...task.querySelectorAll('.choice')];
 const expectedChoice=n%5!==0;
 check(n,missionTitle()===LABELS[(n-1)%5],`title=${missionTitle()}`);
 check(n,expectedChoice?choices.length===3:choices.length===0,`choice count=${choices.length}`);
 if(expectedChoice){
  const correct=choices.filter(x=>x.dataset.ok==='true');
  check(n,correct.length===1,`correct choices=${correct.length}`);
  if(correct[0])correct[0].click();
 }else{
  const input=task.querySelector('.answer'),save=task.querySelector('[data-save]');
  check(n,!!input,'thinking textarea missing');
  check(n,!!save,'thinking save missing');
  if(input&&save){input.value=answerFor();input.dispatchEvent(new Event('input',{bubbles:true}));save.click()}
 }
 return true;
}

function showResult(){
 const old=document.getElementById('grade4-runtime-qa-result');if(old)old.remove();
 const badge=document.createElement('div');
 badge.id='grade4-runtime-qa-result';
 badge.textContent=report.pass?'✅ GRADE 4 RUNTIME QA: 60/60 PASS':'❌ GRADE 4 RUNTIME QA: FAIL';
 badge.style.cssText='position:fixed;z-index:99999;right:16px;bottom:16px;padding:14px 18px;border-radius:12px;background:#090b18;color:#fff;font:700 14px/1.3 system-ui;box-shadow:0 0 24px rgba(0,255,255,.45);border:1px solid rgba(0,255,255,.5)';
 document.body.appendChild(badge);
 console.info('[Grade 4 Runtime QA]',report);
}

async function step(){
 if(mode==='done'){
  report=readJSON(REPORT_KEY,report);
  showResult();
  return;
 }
 snapshot();
 const n=currentMission();
 if(!n){fail(0,'Could not detect current mission');writeJSON(REPORT_KEY,report);return}
 check(n,n>=1&&n<=TOTAL,`detected mission=${n}`);
 if(!report.missions.includes(n))report.missions.push(n);
 runMission(n);
 await sleep(100);
 const complete=document.querySelector('[data-complete]');
 check(n,!!complete&&!complete.disabled,'completion gate did not unlock');
 if(complete&&!complete.disabled){complete.click();await sleep(120)}
 writeJSON(REPORT_KEY,report);
 if(n<TOTAL){
  const u=new URL(location.href);u.searchParams.set(QA_PARAM,'1');
  try{const s=JSON.parse(localStorage.getItem(STATE_KEY)||'{}');s.current=n+1;localStorage.setItem(STATE_KEY,JSON.stringify(s))}catch(e){fail(n,'Could not advance localStorage state')}
  location.replace(u.href);
 }else{
  report.finishedAt=new Date().toISOString();
  report.missionCount=report.missions.length;
  report.pass=report.failures.length===0&&report.missionCount===TOTAL;
  writeJSON(REPORT_KEY,report);
  const restored=restore();
  check(TOTAL,restored,'Could not restore original learner state');
  writeJSON(REPORT_KEY,report);
  const u=new URL(location.href);u.searchParams.set(QA_PARAM,'done');
  location.replace(u.href);
 }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(step,160));
else setTimeout(step,160);
})();
