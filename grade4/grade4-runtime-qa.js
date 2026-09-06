/* Grade 4 — Runtime Interaction QA Harness
 * Opt-in only: run with ?qa=1. Normal learners are never affected.
 * Walks missions 1–60, validates rendered DOM contracts, answers each task,
 * verifies completion, and records a persistent QA report across reloads.
 */
(function(){'use strict';
const QA_PARAM='qa',STATE_KEY='magic-neon-grade-4',REPORT_KEY='grade4-runtime-qa-v1';
const TOTAL=60;
const qs=new URLSearchParams(location.search);
if(qs.get(QA_PARAM)!=='1')return;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const readJSON=(k,d)=>{try{return JSON.parse(sessionStorage.getItem(k)||'null')||d}catch(e){return d}};
const writeJSON=(k,v)=>{try{sessionStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const answerFor=(n)=>'I think this idea is useful because it gives a clear reason. It can help people learn and make a better decision. We should consider evidence and practical results before choosing.';

let report=readJSON(REPORT_KEY,{startedAt:new Date().toISOString(),pass:true,missions:[],checks:0,failures:[]});
const fail=(n,detail)=>{report.pass=false;report.failures.push({mission:n,detail})};
const check=(n,ok,detail)=>{report.checks++;if(!ok)fail(n,detail)};

function currentMission(){
 const m=document.querySelector('.eyebrow:nth-of-type(2)');
 const match=(m?.textContent||'').match(/MISSION\s+(\d+)\s*\/\s*60/i);
 return match?Number(match[1]):null;
}
function runMission(n){
 const task=document.querySelector('.mission-task');
 const complete=document.querySelector('[data-complete]');
 check(n,!!task,'mission-task missing');
 check(n,!!complete,'complete button missing');
 if(!task||!complete)return false;
 const choices=[...task.querySelectorAll('.choice')];
 const title=(document.querySelector('.mission-card h2')?.textContent||'').trim();
 const expectedChoice=n%5!==0;
 check(n,expectedChoice?choices.length===3:choices.length===0,`choice count=${choices.length}`);
 if(expectedChoice){
  const correct=choices.filter(x=>x.dataset.ok==='true');
  check(n,correct.length===1,`correct choices=${correct.length}`);
  if(correct[0])correct[0].click();
 }else{
  const input=task.querySelector('.answer'),save=task.querySelector('[data-save]');
  check(n,!!input,'thinking textarea missing');
  check(n,!!save,'thinking save missing');
  if(input&&save){input.value=answerFor(n);input.dispatchEvent(new Event('input',{bubbles:true}));save.click()}
 }
 return true;
}

async function step(){
 const n=currentMission();
 if(!n){fail(0,'Could not detect current mission');writeJSON(REPORT_KEY,report);return}
 check(n,n>=1&&n<=TOTAL,`detected mission=${n}`);
 if(!report.missions.includes(n))report.missions.push(n);
 runMission(n);
 await sleep(80);
 const complete=document.querySelector('[data-complete]');
 check(n,!!complete&&!complete.disabled,'completion gate did not unlock');
 if(complete&&!complete.disabled){
  complete.click();
  await sleep(100);
 }
 writeJSON(REPORT_KEY,report);
 if(n<TOTAL){
  const u=new URL(location.href);u.searchParams.set(QA_PARAM,'1');
  try{localStorage.setItem(STATE_KEY,JSON.stringify({...JSON.parse(localStorage.getItem(STATE_KEY)||'{}'),current:n+1}))}catch(e){fail(n,'Could not advance localStorage state')}
  location.replace(u.href);
 }else{
  report.finishedAt=new Date().toISOString();
  report.missionCount=report.missions.length;
  report.pass=report.failures.length===0&&report.missionCount===TOTAL;
  writeJSON(REPORT_KEY,report);
  console.info('[Grade 4 Runtime QA]',report);
  const badge=document.createElement('div');
  badge.id='grade4-runtime-qa-result';
  badge.textContent=report.pass?'✅ GRADE 4 RUNTIME QA: 60/60 PASS':'❌ GRADE 4 RUNTIME QA: FAIL';
  badge.style.cssText='position:fixed;z-index:99999;right:16px;bottom:16px;padding:14px 18px;border-radius:12px;background:#090b18;color:#fff;font:700 14px/1.3 system-ui;box-shadow:0 0 24px rgba(0,255,255,.45);border:1px solid rgba(0,255,255,.5)';
  document.body.appendChild(badge);
 }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(step,120));
else setTimeout(step,120);
})();
