/* English with Mariami — Study Pro: additive offline practice UI.
   The original 1512 topics and translations are NEVER changed by this script.
   Learner progress stays in this browser unless explicitly exported by the learner.
   No network, Supabase, timers, background polling, or animation loops. */
(()=>{'use strict';
const $=id=>document.getElementById(id), base=window.MARIAMI_GRAMMAR_LISTENING||{};
const prefix='ewm-study-pro-v1-grade-';
let grade=1,lesson=null,deck=[],cursor=0,revealed=false,mode='mixed',direction='ka-en',seenInSession=0;
const norm=v=>String(v??'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
const today=()=>new Date().toLocaleDateString('en-CA');
const dayMs=86400000;
function safeGrade(v){const n=Number(v);return Number.isInteger(n)&&n>=1&&n<=12?n:null}
function read(g){try{const data=JSON.parse(localStorage.getItem(prefix+g)||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{}}catch{return{}}}
function write(g,value){try{localStorage.setItem(prefix+g,JSON.stringify(value));return true}catch{return false}}
function collection(g){const src=base[g]?.lessons||[],words=[],unique=new Set();for(const l of src)for(const w of l.words||[]){const k=norm(w.en);if(!k||unique.has(k))continue;unique.add(k);words.push({key:k,en:String(w.en),ka:String(w.ka),lessonId:l.id,title:l.titleKa})}return words}
function lessonWords(l){const seen=new Set();return (l?.words||[]).filter(w=>{const k=norm(w.en);if(!k||seen.has(k))return false;seen.add(k);return true}).map(w=>({key:norm(w.en),en:String(w.en),ka:String(w.ka),lessonId:l.id,title:l.titleKa}))}
function getRec(data,k){const r=data[k];return r&&typeof r==='object'?r:null}
function due(rec){return rec&&typeof rec.due==='number'&&rec.due<=Date.now()}
function status(){const all=collection(grade),data=read(grade);let started=0,dueCount=0,mastered=0,mistakes=0;for(const w of all){const r=getRec(data,w.key);if(!r)continue;started++;if(due(r))dueCount++;if((r.level||0)>=4)mastered++;if((r.misses||0)>0&&(r.level||0)<3)mistakes++}
 $('pro-words').textContent=String(all.length);$('pro-started').textContent=String(started);$('pro-due').textContent=String(dueCount);$('pro-mastered').textContent=String(mastered);
 const favs=favorites(grade);$('pro-fav-count').textContent=favs.length+' რჩეული თემა';
 const lcount=(base[grade]?.lessons||[]).filter(l=>{try{return !!localStorage.getItem('mariami-grammar-listening-2026-done-'+l.id)}catch{return false}}).length;
 $('pro-completed').textContent=lcount+' / 126 გამეორებული თემა';
 $('pro-weak-count').textContent=String(mistakes);
}
function favorites(g){const raw=read(g).__fav;return Array.isArray(raw)?raw.filter(x=>typeof x==='string').slice(0,126):[]}
function starLabel(){if(!lesson)return;$('pro-fav').textContent=favorites(grade).includes(lesson.id)?'★ რჩეული თემიდან ამოღება':'☆ რჩეულებში დამატება'}
function setMessage(v){$('pro-message').textContent=v}
function seededShuffle(input){let seed=Number(today().replace(/-/g,''))+grade*131;const a=input.slice();for(let i=a.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function makeDeck(kind){const data=read(grade);let words=kind==='lesson'?lessonWords(lesson):collection(grade);const newWords=words.filter(w=>!getRec(data,w.key)),dueWords=words.filter(w=>due(getRec(data,w.key)));
 if(kind==='due')words=dueWords;else if(kind==='new')words=newWords;else if(kind==='weak')words=words.filter(w=>{const r=getRec(data,w.key);return r&&(r.misses||0)>0&&(r.level||0)<3});else if(kind==='favorites'){const ids=new Set(favorites(grade)),unique=new Set();words=(base[grade]?.lessons||[]).filter(l=>ids.has(l.id)).flatMap(l=>lessonWords(l)).filter(w=>{if(unique.has(w.key))return false;unique.add(w.key);return true})}else if(kind==='mixed')words=[...seededShuffle(dueWords),...seededShuffle(newWords)];else words=seededShuffle(words);
 return words.slice(0,kind==='lesson'?30:15);
}
function start(kind){if(!base[grade]?.lessons){setMessage('ჯერ აირჩიე კლასი.');return}mode=kind;deck=makeDeck(kind);cursor=0;revealed=false;seenInSession=0;
 $('pro-practice').hidden=!deck.length;
 $('pro-finish').hidden=true;
 if(!deck.length){setMessage(kind==='due'?'დღეს გადასამეორებელი სიტყვა არ დაგიგროვდა. სცადე ახალი სიტყვები.':'ამ რეჟიმში სიტყვები არ მოიძებნა. სცადე სხვა რეჟიმი.');return}
 setMessage('მზადაა '+deck.length+' ბარათი. პასუხი გამოაჩინე და შეაფასე, რამდენად კარგად გახსოვდა.');renderCard();$('pro-practice').scrollIntoView({block:'nearest',behavior:'instant'});
}
function renderCard(){const w=deck[cursor];if(!w){$('pro-practice').hidden=true;$('pro-finish').hidden=false;$('pro-finish').textContent='✅ სესია დასრულდა — '+seenInSession+' ბარათი გადაიმეორე!';status();return}
 revealed=false;$('pro-progress').textContent=(cursor+1)+' / '+deck.length+' · კლასი '+grade;
 $('pro-front').textContent=direction==='ka-en'?w.ka:w.en;
 $('pro-back').textContent=direction==='ka-en'?w.en:w.ka;
 $('pro-back').hidden=true;$('pro-show').hidden=false;$('pro-rate').hidden=true;
 $('pro-context').textContent='თემა: '+w.title;$('pro-card-result').textContent='';
}
function reveal(){if(!deck[cursor])return;revealed=true;$('pro-back').hidden=false;$('pro-show').hidden=true;$('pro-rate').hidden=false}
function rate(gradeValue){const w=deck[cursor];if(!w)return;if(!revealed){reveal();return}
 const data=read(grade),old=getRec(data,w.key)||{level:0,hits:0,misses:0};let level=Number(old.level)||0,wait;
 if(gradeValue===0){level=0;wait=10*60*1000;}
 else if(gradeValue===1){level=Math.max(1,level);wait=dayMs;}
 else if(gradeValue===2){level=Math.min(6,Math.max(1,level)+1);wait=([0,1,3,7,14,30,60][level]||30)*dayMs;}
 else{level=Math.min(6,Math.max(2,level)+2);wait=([0,1,3,7,14,30,60][level]||30)*dayMs;}
 data[w.key]={level,due:Date.now()+wait,hits:(old.hits||0)+(gradeValue?1:0),misses:(old.misses||0)+(gradeValue===0?1:0),last:Date.now()};
 if(!write(grade,data)){$('pro-card-result').textContent='⚠️ ბრაუზერმა პროგრესის შენახვა დაბლოკა.';return}
 if(gradeValue===0&&(old.misses||0)<2&&deck.length<25)deck.push(w);
 seenInSession++;cursor++;renderCard();status();
}
function toggleFavorite(){if(!lesson)return;const data=read(grade),items=favorites(grade),i=items.indexOf(lesson.id);if(i<0)items.push(lesson.id);else items.splice(i,1);data.__fav=items;write(grade,data);starLabel();status();setMessage('რჩეული თემების სია შენახულია ამ ბრაუზერში.');}
function showFavs(){const f=favorites(grade),topics=base[grade]?.lessons||[];const names=f.map(id=>topics.find(l=>l.id===id)?.titleKa).filter(Boolean);setMessage(names.length?'რჩეული თემები: '+names.join(' · '):'ჯერ რჩეულებში თემა არ დაგიმატებია. გახსენი სასურველი თემა და დააჭირე ☆ ღილაკს.');}
function speakCard(){const w=deck[cursor];if(!w)return;if(!('speechSynthesis' in window)){setMessage('ხმოვანი სინთეზი მიუწვდომელია ამ ბრაუზერში.');return}
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w.en);u.lang='en-GB';u.rate=Number($('pro-speed').value)||0.85;speechSynthesis.speak(u)}catch{setMessage('ხმის გაშვება ვერ მოხერხდა.')}}
function exportData(){const groups={};for(let g=1;g<=12;g++)groups[String(g)]=read(g);const payload={format:'mariami-study-pro-backup',schema:1,createdAt:new Date().toISOString(),grades:groups};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mariami-study-progress-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);setMessage('პროგრესის ასლი ჩამოიტვირთა. მასში არ შედის საიტის ანგარიშის მონაცემები.');}
async function importData(file){if(!file)return;if(file.size>2_000_000){setMessage('⚠️ ფაილი ძალიან დიდია (მაქს. 2 MB).');return}try{const data=JSON.parse(await file.text());if(data.format!=='mariami-study-pro-backup'||data.schema!==1||!data.grades||typeof data.grades!=='object')throw Error('არასწორი სარეზერვო ფაილია');
 if(!confirm('შევაერთოთ ფაილში შენახული სასწავლო პროგრესი ამ ბრაუზერის პროგრესთან? ძველი ჩანაწერი უპირატესობას შეინარჩუნებს, თუ ის უფრო ახალია.'))return;
 let count=0;for(let g=1;g<=12;g++){const incoming=data.grades[g];if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))continue;const merged=read(g);let n=0;for(const [key,val] of Object.entries(incoming)){if(key==='__fav'&&Array.isArray(val)){merged.__fav=[...new Set([...(merged.__fav||[]),...val.filter(x=>typeof x==='string')])].slice(0,126);continue}if(!/^[\p{L}\p{N} '_\-]{1,120}$/u.test(key)||!val||typeof val!=='object'||Array.isArray(val))continue;
 const last=Number(val.last);if(!Number.isFinite(last)||last<0)continue;
 const original=merged[key];if(!original||last>Number(original.last||0))merged[key]={level:Math.max(0,Math.min(6,Number(val.level)||0)),due:Math.max(0,Number(val.due)||0),hits:Math.max(0,Number(val.hits)||0),misses:Math.max(0,Number(val.misses)||0),last};if(++n>2500)break;
 }if(!write(g,merged))throw Error('ვერ შეინახა პროგრესი');count+=n;}
 status();starLabel();setMessage('✅ პროგრესი გაერთიანდა ('+count+' ჩანაწერი შემოწმდა).');
 }catch(e){setMessage('⚠️ აღდგენა ვერ შესრულდა: '+e.message)}finally{$('pro-import').value=''}}
function resetForLesson(ev){const detail=ev.detail||{};const n=safeGrade(detail.grade);if(!n)return;const changed=n!==grade;grade=n;lesson=detail.lesson||null;status();starLabel();$('pro-current-topic').textContent=lesson?'მიმდინარე თემა: '+lesson.titleKa:'';
 if(changed){deck=[];cursor=0;$('pro-practice').hidden=true;$('pro-finish').hidden=true;setMessage('აირჩიე სასწავლო რეჟიმი. პროგრესი ამ კლასზე ცალკე ინახება.')}}
document.addEventListener('mariami:lesson-rendered',resetForLesson);
$('pro-start-mixed').onclick=()=>start('mixed');$('pro-start-due').onclick=()=>start('due');$('pro-start-new').onclick=()=>start('new');$('pro-start-weak').onclick=()=>start('weak');$('pro-start-lesson').onclick=()=>start('lesson');$('pro-start-fav').onclick=()=>start('favorites');
$('pro-show').onclick=reveal;$('pro-rate-again').onclick=()=>rate(0);$('pro-rate-hard').onclick=()=>rate(1);$('pro-rate-good').onclick=()=>rate(2);$('pro-rate-easy').onclick=()=>rate(3);
$('pro-direction').onchange=()=>{direction=$('pro-direction').value;if(deck[cursor])renderCard()};$('pro-listen').onclick=speakCard;$('pro-fav').onclick=toggleFavorite;$('pro-show-favs').onclick=showFavs;
$('pro-export').onclick=exportData;$('pro-import').onchange=e=>importData(e.target.files?.[0]);
// Handle the case where the first lesson rendered before this add-on finished loading.
const startingGrade=safeGrade($('grade')?.value);
if(startingGrade&&base[startingGrade]?.lessons?.length&&$('lesson-content')&&!$('lesson-content').hidden){
 const id=new URL(location.href).searchParams.get('lesson');
 const current=base[startingGrade].lessons.find(l=>l.id===id)||base[startingGrade].lessons[0];
 resetForLesson({detail:{grade:startingGrade,lesson:current}});
}
document.addEventListener('keydown',e=>{const target=e.target;if(target?.closest('input,textarea,select,button,[contenteditable="true"]'))return;if($('pro-practice').hidden)return;if(e.code==='Space'){e.preventDefault();reveal()}else if(revealed&&e.key>='1'&&e.key<='4'){rate(Number(e.key)-1)}});
})();
