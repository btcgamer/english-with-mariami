/* English with Mariami — optional Study Pro dashboard.
   Reads the approved curriculum and the existing Study Pro/local lesson progress.
   Never changes course data, official grades or Supabase. No background timers. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const base=window.MARIAMI_GRAMMAR_LISTENING||{};
if(!$('ewm-progress')||!$('pro-started')||!$('grade'))return;
const storePrefix='ewm-study-pro-v1-grade-';
const donePrefix='mariami-grammar-listening-2026-done-';
const activityKey='ewm-dashboard-activity-v1';
const goal=15;
const normalize=s=>String(s??'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
const dayKey=t=>{const d=new Date(t);if(!Number.isFinite(d.getTime()))return '';return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function localRead(key){try{return localStorage.getItem(key)}catch{return null}}
function localWrite(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
function gradeNow(){const n=Number($('grade').value);return Number.isInteger(n)&&n>=1&&n<=12?n:null}
function storedData(g){try{const raw=JSON.parse(localRead(storePrefix+g)||'{}');return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{}}catch{return{}}}
function activityRead(){try{const raw=JSON.parse(localRead(activityKey)||'{}');return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{}}catch{return{}}}
function rememberActivity(){const day=dayKey(Date.now()),days=activityRead();days[day]=true; // Keep only recent dates for a tiny local file.
 const recent=Object.keys(days).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort().slice(-400),safe={};for(const d of recent)safe[d]=true;
 localWrite(activityKey,JSON.stringify(safe));}
function streak(){const days=activityRead(),today=dayKey(Date.now());const d=new Date();if(!days[today])d.setDate(d.getDate()-1);let count=0;for(let i=0;i<400;i++){if(!days[dayKey(d)])break;count++;d.setDate(d.getDate()-1)}return count}
function fill(id,value,total){const e=$(id);if(e){e.max=Math.max(1,total);e.value=Math.min(Math.max(0,value),e.max)}const pct=$(id+'-pct');if(pct)pct.textContent=(total?Math.round(value/total*100):0)+'%'}
function rec(data,key){const item=data[key];return item&&typeof item==='object'&&!Array.isArray(item)?item:null}
function uniqueWords(lessons){const all=new Map();for(const l of lessons)for(const w of l.words||[]){const k=normalize(w.en);if(k&&!all.has(k))all.set(k,w)}return all}
function topicDone(id){return !!localRead(donePrefix+id)}
function countTopics(lessons){return lessons.filter(l=>topicDone(l.id)).length}
function drawTopicMeters(lessons,data){const buttons=$('topics')?.querySelectorAll('.topic-item')||[];for(let i=0;i<buttons.length;i++){
 const button=buttons[i],topic=lessons[i]; // Filtered list can differ from full lesson list; find via visible topic labels, not index.
 let l=topic;const title=button.querySelector('span')?.textContent?.replace(/^✓\s*/,'')||'';
 if(!l||l.titleKa!==title)l=lessons.find(item=>item.titleKa===title);
 if(!l)continue;const unique=new Set((l.words||[]).map(w=>normalize(w.en)).filter(Boolean));let started=0;for(const w of unique)if(rec(data,w))started++;
 let meter=button.querySelector('.pg-topic-meter');if(!meter){meter=document.createElement('span');meter.className='pg-topic-meter';meter.innerHTML='<progress max="1" value="0" aria-label="თემის ნავარჯიშები სიტყვები"></progress><b></b>';button.appendChild(meter)}
 const p=meter.querySelector('progress'),label=meter.querySelector('b');p.max=Math.max(1,unique.size);p.value=started;label.textContent=unique.size?Math.round(started/unique.size*100)+'%':'0%';
 }}
function drawLessonMeter(lessons,data){const title=$('title-ka')?.textContent||'',l=lessons.find(x=>x.titleKa===title);const node=$('pg-lesson-meter');if(!node||!l){if(node)node.hidden=true;return}
 const unique=new Set((l.words||[]).map(w=>normalize(w.en)).filter(Boolean));let reviewed=0;for(const word of unique)if(rec(data,word))reviewed++;
 node.hidden=false;const p=$('pg-lesson-bar');p.max=Math.max(1,unique.size);p.value=reviewed;
 $('pg-lesson-count').textContent=reviewed+' / '+unique.size+' სიტყვა ნავარჯიშებია';}
function render(){const g=gradeNow(),lessons=base[g]?.lessons;if(!g||!lessons?.length)return;
 const data=storedData(g),all=uniqueWords(lessons),tday=dayKey(Date.now());let started=0,mastered=0,due=0,todayWords=0,reviews=0;
 for(const [k] of all){const r=rec(data,k);if(!r)continue;started++;const level=Math.min(6,Math.max(0,Number(r.level)||0));if(level>=4)mastered++;
 if(Number.isFinite(Number(r.due))&&Number(r.due)<=Date.now())due++;
 if(dayKey(Number(r.last))===tday)todayWords++;
 reviews+=Math.max(0,Number(r.hits)||0)+Math.max(0,Number(r.misses)||0);
 }
 const completed=countTopics(lessons),streakN=streak(),xp=reviews*10+completed*25;
 $('pg-day-count').textContent=todayWords+' / '+goal;
 $('pg-streak').textContent=String(streakN);
 $('pg-xp').textContent=xp.toLocaleString('en-US');
 $('pg-ring-num').textContent=Math.round(completed/lessons.length*100)+'%';
 $('pg-ring').style.setProperty('--pct',String(Math.round(completed/lessons.length*100)));
 $('pg-total-done').textContent=completed+' / '+lessons.length;
 $('pg-started-detail').textContent=started+' / '+all.size+' განსხვავებული სიტყვა';
 $('pg-mastered-detail').textContent=mastered+' / '+all.size+' დამახსოვრებულია';
 $('pg-daily-detail').textContent=todayWords>=goal?'დღიური მიზანი შესრულებულია 🎉':'დარჩა '+Math.max(0,goal-todayWords)+' ახალი შეფასებული სიტყვა დღიური მიზნისთვის';
 fill('pg-lessons',completed,lessons.length);fill('pg-started',started,all.size);fill('pg-mastered',mastered,all.size);fill('pg-daily',todayWords,goal);
 $('pg-due-count').textContent=String(due);
 const unlock=[{label:'🌱 პირველი ნაბიჯი',ok:started>=1},{label:'📘 5 დასრულებული თემა',ok:completed>=5},{label:'🧠 50 დამახსოვრებული',ok:mastered>=50},{label:'🔥 3-დღიანი სერია',ok:streakN>=3}];
 const awardHost=$('pg-awards');awardHost.replaceChildren();for(const a of unlock){const el=document.createElement('span');el.className='pg-award';el.textContent=a.label;el.setAttribute('aria-disabled',String(!a.ok));el.title=a.ok?'მიღწეულია':'ჯერ მიუღწეველია';awardHost.appendChild(el)}
 const hint=due>0?'🔁 დღეს '+due+' სიტყვა ელოდება გამეორებას. დაიწყე „გასამეორებელი“ რეჟიმით.':started<all.size?'🌱 გასამეორებელი ჯერ არ გაქვს. სცადე „ახალი სიტყვები“ და გააგრძელე სწავლა.':completed<lessons.length?'📖 სიტყვების პრაქტიკა კარგია! აირჩიე თემა და დაასრულე დარჩენილი გაკვეთილები.':'🏆 ამ კლასში ყველა თემა დასრულებულად არის მონიშნული!';
 $('pg-next').textContent=hint;
 drawLessonMeter(lessons,data);drawTopicMeters(lessons,data);
 updateSession();
}
function updateSession(){const box=$('pg-session-box'),text=$('pro-progress')?.textContent||'',active=$('pro-practice')&&!$('pro-practice').hidden,finished=$('pro-finish')&&!$('pro-finish').hidden;
 if(!box)return;box.hidden=!(active||finished);if(box.hidden)return;
 const match=text.match(/(\d+)\s*\/\s*(\d+)/);let total=match?Number(match[2]):0,done=match?Number(match[1])-1:0;
 if(finished&&total)done=total;
 const p=$('pg-session-bar');p.max=Math.max(1,total);p.value=Math.max(0,Math.min(total,done));
 $('pg-session-count').textContent=finished?'სესია დასრულდა ✅':(done+' / '+total+' ბარათი შეფასებულია');
}
// The original Study Pro onclick callbacks are registered before this additive script.
// Adding these later click listeners refreshes the dashboard after a successfully saved review.
function refreshAfterReview(){const g=gradeNow(),records=storedData(g||1),changed=Object.values(records).some(v=>v&&typeof v==='object'&&Number(v.last)>Date.now()-1500);if(changed)rememberActivity();render()}
for(const id of ['pro-rate-again','pro-rate-hard','pro-rate-good','pro-rate-easy'])$(id)?.addEventListener('click',refreshAfterReview);
// Study Pro also accepts 1–4 keyboard shortcuts; include these review actions.
document.addEventListener('keydown',e=>{if(e.defaultPrevented&&e.code==='Space')return;if(e.key<'1'||e.key>'4')return;if(e.target?.closest('input,textarea,select,button,[contenteditable="true"]'))return;if(!$('pro-practice')?.hidden)refreshAfterReview()});
$('mark-done')?.addEventListener('click',()=>{rememberActivity();render()});
// The original import handler is asynchronous. Refresh only after it reports completion.
if($('pro-message'))new MutationObserver(()=>{if(($('pro-message').textContent||'').startsWith('✅ პროგრესი გაერთიანდა'))render()}).observe($('pro-message'),{childList:true,subtree:true});
$('pro-start-mixed')?.addEventListener('click',updateSession);
for(const id of ['pro-start-due','pro-start-new','pro-start-weak','pro-start-lesson','pro-start-fav'])$(id)?.addEventListener('click',updateSession);
$('pro-show')?.addEventListener('click',updateSession);
const session=$('pro-progress');if(session)new MutationObserver(updateSession).observe(session,{childList:true,characterData:true,subtree:true});
for(const id of ['pro-practice','pro-finish'])if($(id))new MutationObserver(updateSession).observe($(id),{attributes:true,attributeFilter:['hidden']});
document.addEventListener('mariami:lesson-rendered',render);
if(base[gradeNow()]?.lessons?.length)render();
})();
