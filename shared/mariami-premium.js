/* English with Mariami — PREMIUM LEARNING (additive UI only).
 * All statistics come from existing local Study Pro records. No remote services,
 * synthetic learner data, new lesson writes, timers, or background processing.
 * Only the learner's daily-goal preference is persisted here.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
if(!$('premium-week-chart')||!$('grade')||!$('premium-goal'))return;
const grades=window.MARIAMI_GRAMMAR_LISTENING||{};
const prefix='ewm-study-pro-v1-grade-',donePrefix='mariami-grammar-listening-2026-done-';
const goalKey='ewm-premium-daily-goal-v1';
const allowed=[5,10,15,20,30];
const normalize=v=>String(v??'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
const localDay=date=>{const d=new Date(date);if(!Number.isFinite(d.getTime()))return '';return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function readLocal(key){try{return localStorage.getItem(key)}catch{return null}}
function currentGrade(){const n=Number($('grade').value);return Number.isInteger(n)&&n>=1&&n<=12?n:null}
function records(g){try{const p=JSON.parse(readLocal(prefix+g)||'{}');return p&&typeof p==='object'&&!Array.isArray(p)?p:{}}catch{return {}}}
function availableWords(lessons){const unique=new Set();for(const lesson of lessons)for(const w of lesson.words||[]){const key=normalize(w.en);if(key)unique.add(key)}return unique}
function loadGoal(){const n=Number(readLocal(goalKey));return allowed.includes(n)?n:15}
function saveGoal(v){const n=Number(v);if(!allowed.includes(n))return;try{localStorage.setItem(goalKey,String(n))}catch{}render()}
function setText(id,v){const n=$(id);if(n)n.textContent=String(v)}
function bar(id,value,total){const p=$(id);if(!p)return;p.max=Math.max(1,total);p.value=Math.min(Math.max(0,value),p.max)}
function lessonCompleted(id){return !!readLocal(donePrefix+id)}
function moveToPractice(button){const b=$(button);if(!b)return;b.click();if(!$('pro-practice')?.hidden)$('pro-practice').scrollIntoView({block:'start',behavior:'auto'});else $('pro-hub')?.scrollIntoView({block:'start',behavior:'auto'})}
function goLessons(){$('lesson')?.scrollIntoView({block:'start',behavior:'auto'});$('search')?.focus({preventScroll:true})}
function renderWeek(history){const host=$('premium-week-chart');const today=new Date();today.setHours(12,0,0,0);const dates=[];
 for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);dates.push(d)}
 const vals=dates.map(d=>history[localDay(d)]||0),max=Math.max(1,...vals);
 host.replaceChildren();let total=0;
 dates.forEach((d,i)=>{const n=vals[i];total+=n;const col=document.createElement('div');col.className='premium-week-day'+(i===6?' is-today':'');
 const num=document.createElement('span');num.className='premium-week-count';num.textContent=String(n);
 const track=document.createElement('div');track.className='premium-week-track';
 const fill=document.createElement('span');fill.className='premium-week-fill';fill.style.height=n?(Math.max(5,Math.round(n/max*100))+'%'):'0%';track.appendChild(fill);
 const label=document.createElement('span');label.className='premium-week-label';label.textContent=['კვ','ორ','სამ','ოთხ','ხუთ','პარ','შაბ'][d.getDay()];
 col.title=localDay(d)+' — '+n+' სიტყვა (ბოლო შეფასების მიხედვით)';col.append(num,track,label);host.appendChild(col)});
 setText('premium-week-total',total+' სიტყვა');
 host.setAttribute('aria-label','ბოლო 7 დღე — სიტყვების ბოლო შეფასებები: '+vals.join(', '));
}
function render(){const g=currentGrade(),lessons=grades[g]?.lessons;if(!g||!Array.isArray(lessons))return;
 const data=records(g),unique=availableWords(lessons),now=Date.now();
 const hist=Object.create(null);let reviewed=0,mastered=0,hard=0,learning=0,due=0,dueSoon=0;
 for(const k of unique){const r=data[k];if(!r||typeof r!=='object'||Array.isArray(r))continue;
 reviewed++;
 const level=Math.max(0,Math.min(6,Number(r.level)||0));
 if(level>=4)mastered++;else if((Number(r.misses)||0)>0&&level<3)hard++;else learning++;
 const dueAt=Number(r.due);if(Number.isFinite(dueAt)&&dueAt>0){if(dueAt<=now)due++;else if(dueAt<=now+2*86400000)dueSoon++}
 const last=Number(r.last);const key=localDay(last);if(last>0&&key)hist[key]=(hist[key]||0)+1;
 }
 const unseen=unique.size-reviewed,done=lessons.filter(l=>lessonCompleted(l.id)).length;
 const counts={strong:mastered,learning,hard,unseen};
 for(const [name,count] of Object.entries(counts)){
  const el=$('premium-memory-'+name);if(el)el.style.width=(unique.size?Math.max(0,count)/unique.size*100:0)+'%';
  setText('premium-memory-'+name+'-n',count);
 }
 setText('premium-memory-total',unique.size+' სიტყვა');
 $('premium-memory-meter').setAttribute('aria-label','დამახსოვრებული '+mastered+', სწავლაში '+learning+', რთული '+hard+', ახალი '+unseen);
 setText('premium-grade-label',g+' კლასი · '+lessons.length+' თემა');
 setText('premium-due-mini',due?'დღეს '+due+' სიტყვაა გასამეორებელი':dueSoon?'მომდევნო 2 დღეში '+dueSoon+' სიტყვა':'შემდეგი გამეორება დაგეგმილ დროს');
 setText('premium-lesson-mini',done+' / '+lessons.length+' თემა დასრულებულია');
 renderWeek(hist);
 let title,desc,button,target,amount,label;
 if(due){title='გაიმეორე დღეს დაგეგმილი სიტყვები';desc='დროა ძველი სიტყვები გაიმყარო, სანამ ახალ მასალას გადახვალ.';button='გაიმეორე ახლა →';target='pro-start-due';amount=due;label='გასამეორებელი'}
 else if(unseen){title='აღმოაჩინე შემდეგი ახალი სიტყვები';desc='დღეს შეგიძლია ახალი სიტყვებით განაგრძო სწავლა. თითო შეფასება პროგრესში აისახება.';button='ახალი სიტყვები →';target='pro-start-new';amount=unseen;label='ახალი სიტყვა'}
 else if(hard){title='გაამყარე რთული სიტყვები';desc='ყველაზე ხშირად გაჭირვებულ სიტყვებს ცალკე დაუბრუნდი.';button='რთული სიტყვები →';target='pro-start-weak';amount=hard;label='რთული სიტყვა'}
 else{title='გააგრძელე სწავლა საკუთარი ტემპით';desc='აირჩიე შემდეგი გაკვეთილი ან გაიმეორე შესწავლილი სიტყვები.';button='დღევანდელი ვარჯიში →';target='pro-start-mixed';amount=Math.max(0,lessons.length-done);label='დარჩენილი თემა'}
 setText('premium-focus-title',title);setText('premium-focus-desc',desc);setText('premium-focus-action',button);setText('premium-focus-number',amount);setText('premium-focus-unit',label);
 $('premium-focus-action').dataset.target=target;
 const todayN=hist[localDay(now)]||0,goal=loadGoal();$('premium-goal').value=String(goal);
 // The original progress add-on has a fixed 15-word goal. Refine only this presentation.
 bar('pg-daily',todayN,goal);setText('pg-daily-pct',Math.round(Math.min(1,todayN/goal)*100)+'%');
 setText('pg-day-count',todayN+' / '+goal);
 setText('pg-daily-detail',todayN>=goal?'დღიური მიზანი შესრულებულია 🎉': 'დარჩა '+(goal-todayN)+' განსხვავებული სიტყვის შეფასება');
}
$('premium-goal').addEventListener('change',e=>saveGoal(e.target.value));
$('premium-open-lessons').addEventListener('click',goLessons);
$('premium-go-lessons').addEventListener('click',goLessons);
$('premium-go-new').addEventListener('click',()=>moveToPractice('pro-start-new'));
$('premium-go-due').addEventListener('click',()=>moveToPractice('pro-start-due'));
$('premium-focus-action').addEventListener('click',()=>moveToPractice($('premium-focus-action').dataset.target||'pro-start-mixed'));
for(const id of ['pro-rate-again','pro-rate-hard','pro-rate-good','pro-rate-easy','mark-done'])$(id)?.addEventListener('click',render);
document.addEventListener('keydown',e=>{if(!['1','2','3','4'].includes(e.key))return;if(e.target?.closest('input,textarea,select,button,[contenteditable="true"]'))return;if(!$('pro-practice')?.hidden)render()});
document.addEventListener('mariami:lesson-rendered',render);
const proMessage=$('pro-message');if(proMessage)new MutationObserver(()=>{if(proMessage.textContent?.startsWith('✅ პროგრესი გაერთიანდა'))render()}).observe(proMessage,{childList:true,subtree:true});
if(grades[currentGrade()]?.lessons)render();
})();
