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
function dailyGoal(){const value=Number(localRead('ewm-premium-daily-goal-v1'));return [5,10,15,20,30].includes(value)?value:15}
function percent(value,total){const n=total?Math.min(100,Math.max(0,value/total*100)):0;return (n>0&&n<1?Number(n.toFixed(2)):Math.round(n))+'%'}
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
function fill(id,value,total){const e=$(id);if(e){e.max=Math.max(1,total);e.value=Math.min(Math.max(0,value),e.max);e.dataset.hasProgress=String(e.value>0);e.setAttribute('aria-valuetext',value+' / '+total+' · '+percent(value,total))}const pct=$(id+'-pct');if(pct)pct.textContent=percent(value,total)}
function rec(data,key){const item=data[key];return item&&typeof item==='object'&&!Array.isArray(item)?item:null}
function uniqueWords(lessons){const all=new Map();for(const l of lessons)for(const w of l.words||[]){const k=normalize(w.en);if(k&&!all.has(k))all.set(k,w)}return all}
function topicDone(id){return !!localRead(donePrefix+id)}
function countTopics(lessons){return lessons.filter(l=>topicDone(l.id)).length}
function reviewedCount(lesson,data){const words=new Set((lesson.words||[]).map(w=>normalize(w.en)).filter(Boolean));return {total:words.size,done:[...words].filter(word=>rec(data,word)).length}}
function drawTopicMeters(lessons,data){const byId=new Map(lessons.map(lesson=>[String(lesson.id),lesson]));for(const button of $('topics')?.querySelectorAll('.topic-item')||[]){
 const lesson=byId.get(button.dataset.lessonId);if(!lesson)continue;
 const count=reviewedCount(lesson,data);let meter=button.querySelector('.pg-topic-meter');if(!meter){meter=document.createElement('span');meter.className='pg-topic-meter';meter.innerHTML='<progress max="1" value="0" aria-label="თემის ნავარჯიშები სიტყვები"></progress><b></b>';button.appendChild(meter)}
 const bar=meter.querySelector('progress');bar.max=Math.max(1,count.total);bar.value=count.done;bar.dataset.hasProgress=String(count.done>0);bar.setAttribute('aria-valuetext',count.done+' / '+count.total);meter.querySelector('b').textContent=percent(count.done,count.total);
}}
function drawLessonMeter(lessons,data){const id=new URL(location.href).searchParams.get('lesson'),lesson=lessons.find(item=>String(item.id)===id),node=$('pg-lesson-meter');if(!node||!lesson){if(node)node.hidden=true;return}
 const count=reviewedCount(lesson,data);node.hidden=false;fill('pg-lesson-bar',count.done,count.total);$('pg-lesson-count').textContent=count.done+' / '+count.total+' სიტყვა ნავარჯიშებია';}
function render(){const g=gradeNow(),lessons=base[g]?.lessons;if(!g||!lessons?.length)return;
 const data=storedData(g),all=uniqueWords(lessons),tday=dayKey(Date.now());let started=0,mastered=0,due=0,todayWords=0,reviews=0;
 for(const [k] of all){const r=rec(data,k);if(!r)continue;started++;const level=Math.min(6,Math.max(0,Number(r.level)||0));if(level>=4)mastered++;
 if(Number.isFinite(Number(r.due))&&Number(r.due)<=Date.now())due++;
 if(dayKey(Number(r.last))===tday)todayWords++;
 reviews+=Math.max(0,Number(r.hits)||0)+Math.max(0,Number(r.misses)||0);
 }
 const completed=countTopics(lessons),streakN=streak(),xp=reviews*10+completed*25,goal=dailyGoal();
 $('pg-day-count').textContent=todayWords+' / '+goal;
 $('pg-streak').textContent=String(streakN);
 $('pg-xp').textContent=xp.toLocaleString('en-US');
 $('pg-ring-num').textContent=percent(completed,lessons.length);
 $('pg-ring').style.setProperty('--pct',String(completed/lessons.length*100));$('pg-ring').setAttribute('role','progressbar');$('pg-ring').setAttribute('aria-valuemin','0');$('pg-ring').setAttribute('aria-valuemax',String(lessons.length));$('pg-ring').setAttribute('aria-valuenow',String(completed));$('pg-ring').setAttribute('aria-valuetext',completed+' / '+lessons.length+' · '+percent(completed,lessons.length));
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
function updateSession(){const box=$('pg-session-box'),host=$('pro-practice');if(!box||!host)return;
 const total=Number(host.dataset.sessionTotal)||0,done=Math.min(total,Number(host.dataset.sessionReviewed)||0),finished=host.dataset.sessionFinished==='true';
 box.hidden=total===0;if(box.hidden)return;fill('pg-session-bar',done,total);$('pg-session-count').textContent=finished?'სესია დასრულდა · '+done+' / '+total+' ბარათი':done+' / '+total+' ბარათი შეფასებულია';
}
document.addEventListener('mariami:progress-changed',event=>{if(['review','lesson'].includes(event.detail?.source))rememberActivity();render()});
document.addEventListener('mariami:lesson-rendered',render);
addEventListener('storage',event=>{if(!event.key||['ewm-premium-daily-goal-v1',activityKey].includes(event.key))render()});
addEventListener('pageshow',render);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
if(base[gradeNow()]?.lessons?.length)render();
})();
