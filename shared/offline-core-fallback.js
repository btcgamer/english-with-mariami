/* English with Mariami — offline-safe Grade 2/3/4 data bridge.
   It activates only when the real Supabase browser client is unavailable.
   The goal is to keep the learning UI usable instead of rendering an empty shell. */
(function(){
  'use strict';
  if (window.__ENGLISH_MARIAMI_OFFLINE_CORE__) return;
  if (window.supabaseClient || window.__ENGLISH_MARIAMI_SUPABASE_CLIENT) return;

  const path=(location.pathname||'').toLowerCase();
  const match=path.match(/grade([234])/);
  if(!match) return;
  const grade=Number(match[1]);
  const uid='offline-demo-student';
  const topics=[
    ['Alphabet & Sounds','ანბანი და ბგერები','Learn letters, sounds and simple words.'],
    ['Numbers','რიცხვები','Count, compare and use numbers in English.'],
    ['Colors','ფერები','Name colors and describe the world around you.'],
    ['Family','ოჯახი','Talk about family members and relationships.'],
    ['Home','სახლი','Name rooms, objects and places at home.'],
    ['School','სკოლა','Use English for classroom objects and actions.'],
    ['Animals','ცხოველები','Describe animals and what they can do.'],
    ['Food','საკვები','Talk about food, meals and preferences.'],
    ['Weather','ამინდი','Describe weather and seasons.'],
    ['Clothes','ტანსაცმელი','Name clothes and describe what people wear.'],
    ['Daily Routine','ყოველდღიური რუტინა','Talk about everyday actions and time.'],
    ['Transport','ტრანსპორტი','Talk about transport and travel.'],
    ['City','ქალაქი','Find and describe places in a city.'],
    ['Nature','ბუნება','Describe nature, plants and outdoor places.'],
    ['Grammar Core','გრამატიკის ბირთვი','Build clear English sentences.'],
    ['Questions','კითხვები','Ask and answer useful English questions.'],
    ['Reading','კითხვა','Read short texts and find key information.'],
    ['Listening','მოსმენა','Listen, understand and repeat useful English.'],
    ['Speaking','საუბარი','Speak in short complete sentences.'],
    ['Brain Games','გონების თამაშები','Solve English puzzles and challenges.']
  ];
  const words=[
    ['book','წიგნი','📘'],['school','სკოლა','🏫'],['friend','მეგობარი','🤝'],['happy','ბედნიერი','😊'],['blue','ლურჯი','🔵'],
    ['family','ოჯახი','👨‍👩‍👧'],['house','სახლი','🏠'],['cat','კატა','🐱'],['apple','ვაშლი','🍎'],['sunny','მზიანი','☀️'],
    ['shirt','პერანგი','👕'],['morning','დილა','🌅'],['bus','ავტობუსი','🚌'],['park','პარკი','🌳'],['learn','სწავლა','🧠']
  ];
  function lessonData(n){
    const t=topics[(n-1)%topics.length], sentence=n%2===0?'I practice English every day.':'She likes learning English.';
    return {id:'offline-g'+grade+'-'+String(n).padStart(2,'0'),grade,lesson_number:n,title:t[0]+' • Mission '+String(n).padStart(2,'0'),topic:t[1],description:t[2],grammar_rule:'Use simple English patterns to talk about '+t[0].toLowerCase()+'.',grammar_examples:[sentence,'Ask one question and give one complete answer.'],listening_text:'Listen and repeat: '+sentence,speaking_phrases:['Tell your partner about '+t[0].toLowerCase()+'.','I can talk about '+t[0].toLowerCase()+'.'],reading_text:'This is a short reading mission about '+t[0].toLowerCase()+'. Read carefully and find the main idea.',exercises:['Read the model sentence aloud.','Write one new sentence.','Complete the challenge.']};
  }
  const LESSONS=Array.from({length:60},(_,i)=>lessonData(i+1));
  const WORD_ROWS=[];
  LESSONS.forEach((l,i)=>words.forEach((w,j)=>WORD_ROWS.push({id:'ow-'+grade+'-'+i+'-'+j,lesson_id:l.id,word:w[0],translation:w[1],emoji:w[2],sort_order:j+1})));
  const QUIZ_ROWS=LESSONS.map(l=>({id:'oq-'+l.lesson_number,lesson_id:l.id,question:'Choose the correct sentence.',options:['I practice English every day.','English every I practice.','Practice every English I.'],correct_answer:'I practice English every day.',sort_order:1}));

  function rowsFor(table){
    if(table==='lessons') return LESSONS.slice();
    if(table==='lesson_words') return WORD_ROWS.slice();
    if(table==='lesson_quizzes') return QUIZ_ROWS.slice();
    if(table==='lesson_progress') return [];
    if(table==='academy_reward_state') return [{xp:0,stars:0}];
    if(table==='academy_streaks') return [{current_streak:0}];
    if(table==='profiles') return [{user_id:uid,role:'student',grade}];
    return [];
  }
  function builder(table){
    let rows=rowsFor(table),filters=[];
    const api={
      select(){return api},eq(k,v){filters.push([k,'eq',v]);return api},gte(k,v){filters.push([k,'gte',v]);return api},lte(k,v){filters.push([k,'lte',v]);return api},in(k,v){filters.push([k,'in',Array.isArray(v)?v:[]]);return api},order(k,o){rows.sort((a,b)=>String(a[k]??'').localeCompare(String(b[k]??''),undefined,{numeric:true}));if(o&&o.ascending===false)rows.reverse();return api},maybeSingle(){return Promise.resolve({data:rows.filter(x=>matches(x,filters))[0]||null,error:null})},upsert(){return Promise.resolve({data:null,error:null})},then(resolve,reject){return Promise.resolve({data:rows.filter(x=>matches(x,filters)),error:null}).then(resolve,reject)}
    }; return api;
  }
  function matches(row,filters){return filters.every(([k,op,v])=>{const rv=row[k];if(op==='eq')return String(rv)===String(v);if(op==='gte')return Number(rv)>=Number(v);if(op==='lte')return Number(rv)<=Number(v);if(op==='in')return v.some(x=>String(x)===String(rv));return true})}
  const fake={
    __offlineCore:true,
    auth:{
      async getUser(){return {data:{user:{id:uid}},error:null}},
      async getSession(){return {data:{session:{user:{id:uid}}},error:null}},
      onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}},
      async signOut(){return {error:null}}
    },
    from(table){return builder(table)},
    async rpc(){return {data:null,error:null}}
  };
  window.supabaseClient=fake;
  window.__ENGLISH_MARIAMI_SUPABASE_CLIENT=fake;
  window.__ENGLISH_MARIAMI_OFFLINE_CORE__={grade,lessons:LESSONS,words:WORD_ROWS,quizzes:QUIZ_ROWS};
  if(!window.supabase) window.supabase={createClient(){return fake}};
  console.warn('[Offline Core] Supabase unavailable — Grade '+grade+' is running on a local 60-mission safety dataset.');
})();
