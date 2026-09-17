/* MAGIC ENGLISH — Advanced Curriculum Runtime v3
   Grades 5–12: world loader + mission completion + XP/stars + progress + world unlocks.
   Intentionally isolated from the legacy Grade 2/3/4 lesson engine.
*/
(function () {
  'use strict';

  const DEFAULT_CONFIG = { root:'curriculum', worldCount:10, missionCount:20, xpPerMission:50, starsPerMission:1 };
  const state = { grade:0, world:1, worldData:null, cache:new Map(), loading:false, completed:new Set() };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const getConfig = () => Object.assign({}, DEFAULT_CONFIG, window.MAGIC_CURRICULUM_CONFIG || {});
  const storageKey = grade => `magicCurriculumProgress:g${grade}`;

  function getGrade(){
    const value=(document.body&&Number(document.body.dataset.grade))||Number(window.MAGIC_CURRICULUM_GRADE);
    return Number.isInteger(value)?value:0;
  }
  function worldUrl(grade,world){ return `${String(getConfig().root).replace(/\/$/,'')}/grade${grade}-world${world}.json`; }
  function missionNumber(item,index){ return Number(item.mission||item.id||index+1)||index+1; }
  function missionKey(grade,world,number){ return `${grade}:${world}:${number}`; }
  function completedInWorld(world){ return [...state.completed].filter(key=>key.startsWith(`${state.grade}:${world}:`)).length; }
  function worldUnlocked(world){ return world===1 || completedInWorld(world-1) >= getConfig().missionCount; }
  function completedTotal(){ return [...state.completed].filter(key=>key.startsWith(`${state.grade}:`)).length; }
  function xpTotal(){ return completedTotal()*getConfig().xpPerMission; }
  function starsTotal(){ return completedTotal()*getConfig().starsPerMission; }
  function currentWorldProgress(){ return completedInWorld(state.world); }

  async function fetchWorld(grade,world){
    const key=`${grade}:${world}`;
    if(state.cache.has(key)) return state.cache.get(key);
    const response=await fetch(worldUrl(grade,world),{cache:'no-store',headers:{Accept:'application/json'}});
    if(!response.ok) throw new Error(`Curriculum World ${world} ვერ ჩაიტვირთა (${response.status}).`);
    const data=await response.json(); validateWorld(data,grade,world); state.cache.set(key,data); return data;
  }
  function validateWorld(data,grade,world){
    if(!data||Number(data.grade)!==grade||Number(data.world)!==world) throw new Error(`არასწორი curriculum ფაილი: Grade ${grade} World ${world}.`);
    if(!Array.isArray(data.missions)) throw new Error(`Grade ${grade} World ${world}: missions მასივი ვერ მოიძებნა.`);
  }

  function renderProgress(){
    const q=s=>document.querySelector(s),xp=q('[data-curriculum-xp]'),stars=q('[data-curriculum-stars]'),world=q('[data-curriculum-world-progress]'),total=q('[data-curriculum-total-progress]'),status=q('[data-curriculum-world-status]');
    if(xp)xp.textContent=xpTotal(); if(stars)stars.textContent=starsTotal();
    if(world)world.textContent=`${currentWorldProgress()}/${getConfig().missionCount}`;
    if(total)total.textContent=`${completedTotal()}/${getConfig().worldCount*getConfig().missionCount}`;
    if(status){const next=state.world+1;if(next<=getConfig().worldCount)status.textContent=worldUnlocked(next)?`WORLD ${next} UNLOCKED`:`WORLD ${next} LOCKED • COMPLETE WORLD ${state.world}`;else status.textContent='ALL WORLDS COMPLETE • MASTER STATUS';}
  }

  function renderWorldNav(host,grade,activeWorld){
    if(!host)return;
    host.innerHTML=Array.from({length:getConfig().worldCount},(_,i)=>{
      const world=i+1,unlocked=worldUnlocked(world),active=world===activeWorld;
      return `<button class="magic-world-btn ${active?'active ':''}${unlocked?'':'is-locked'}" data-curriculum-world="${world}" ${unlocked?'':'disabled aria-disabled="true"'}>${unlocked?'WORLD':'🔒 WORLD'} ${world}</button>`;
    }).join('');
    host.querySelectorAll('[data-curriculum-world]:not(:disabled)').forEach(button=>button.addEventListener('click',()=>loadWorld(grade,Number(button.dataset.curriculumWorld))));
  }
  function renderTargets(targets){
    if(!targets||typeof targets!=='object')return '';
    return Object.entries(targets).map(([key,value])=>{const label=key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());return `<div class="magic-target"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`;}).join('');
  }
  function renderMissions(missions){
    return missions.map((mission,index)=>{const number=missionNumber(mission,index),done=state.completed.has(missionKey(state.grade,state.world,number)),title=mission.title||mission.name||`Mission ${number}`,focus=mission.focus||mission.description||mission.objective||'';return `<article class="magic-mission-card ${done?'is-complete':''}" data-mission="${esc(number)}"><div class="magic-mission-number">MISSION ${esc(number)} ${done?'✓':''}</div><h3>${esc(title)}</h3>${focus?`<p>${esc(focus)}</p>`:''}<button type="button" class="magic-mission-open" data-open-mission="${esc(number)}">${done?'REPLAY ↻':'ACTIVATE →'}</button></article>`;}).join('');
  }
  function renderGenericList(value){
    if(value==null)return '<div class="magic-empty">No data available.</div>';
    const renderItem=(item,index)=>{
      if(item==null)return '';
      if(typeof item==='string'||typeof item==='number'||typeof item==='boolean')return `<div>${esc(item)}</div>`;
      if(Array.isArray(item))return `<div class="magic-nested-list">${item.map((nested,nestedIndex)=>renderItem(nested,nestedIndex)).join('')}</div>`;
      const entries=Object.entries(item);
      if(!entries.length)return '<div class="magic-empty">No data available.</div>';
      const title=item.title||item.name||item.scenario||item.area||item.type||`Item ${index+1}`;
      const primaryKeys=['title','name','scenario','area','type'];
      const bodyKeys=['description','task','outcome','criteria','details'];
      const primary=entries.find(([key])=>bodyKeys.includes(key));
      const extra=entries.filter(([key])=>!primaryKeys.includes(key)&&(!primary||key!==primary[0]));
      const body=primary?primary[1]:null;
      const extras=extra.map(([key,val])=>{
        const label=key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
        return `<div class="magic-list-field"><small>${esc(label)}</small>${Array.isArray(val)||typeof val==='object'?renderGenericList(val):`<span>${esc(val)}</span>`}</div>`;
      }).join('');
      return `<div><strong>${esc(title)}</strong>${body!=null?`<p>${Array.isArray(body)||typeof body==='object'?renderGenericList(body):esc(body)}</p>`:''}${extras}</div>`;
    };
    const items=Array.isArray(value)?value:[value];
    return `<div class="magic-list">${items.map(renderItem).join('')}</div>`;
  }
  function renderWorld(data){
    const q=s=>document.querySelector(s),title=q('[data-curriculum-title]'),level=q('[data-curriculum-level]'),targets=q('[data-curriculum-targets]'),missions=q('[data-curriculum-missions]'),scenarios=q('[data-curriculum-scenarios]'),assessment=q('[data-curriculum-assessment]');
    if(title)title.textContent=data.title||`Grade ${data.grade} World ${data.world}`; if(level)level.textContent=data.level||''; if(targets)targets.innerHTML=renderTargets(data.targets); if(missions)missions.innerHTML=renderMissions(data.missions||[]); if(scenarios)scenarios.innerHTML=renderGenericList(data.realWorldScenarios ?? data.scenarios); if(assessment)assessment.innerHTML=renderGenericList(data.assessment);
    document.querySelectorAll('[data-open-mission]').forEach(button=>button.addEventListener('click',()=>openMission(Number(button.dataset.openMission))));
    renderProgress(); renderWorldNav(document.querySelector('[data-curriculum-world-nav]'),state.grade,state.world);
  }
  function renderMissionDetail(mission){
    const omit=new Set(['mission','id','title','name']);
    return `<div class="magic-mission-detail">${Object.entries(mission).filter(([key,value])=>!omit.has(key)&&value!=null).map(([key,value])=>{const label=key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()),content=typeof value==='object'?JSON.stringify(value,null,2):String(value);return `<section><h4>${esc(label)}</h4><p>${esc(content)}</p></section>`;}).join('')}</div>`;
  }
  function openMission(number){
    const data=state.worldData,mission=(data?.missions||[]).find((item,index)=>missionNumber(item,index)===number); if(!mission)return;
    window.dispatchEvent(new CustomEvent('magicCurriculumMissionOpen',{detail:{grade:state.grade,world:state.world,mission,worldData:data}}));
    const modal=document.querySelector('[data-curriculum-modal]'); if(!modal)return;
    const title=modal.querySelector('[data-curriculum-modal-title]'),body=modal.querySelector('[data-curriculum-modal-body]'),complete=modal.querySelector('[data-curriculum-complete]');
    if(title)title.textContent=`MISSION ${number} — ${mission.title||mission.name||'Mission'}`; if(body)body.innerHTML=renderMissionDetail(mission);
    if(complete){complete.hidden=false;complete.disabled=state.completed.has(missionKey(state.grade,state.world,number));complete.dataset.mission=String(number);complete.textContent=state.completed.has(missionKey(state.grade,state.world,number))?'COMPLETED ✓':'MARK MISSION COMPLETE • +'+getConfig().xpPerMission+' XP • +'+getConfig().starsPerMission+' ★';}
    modal.hidden=false;modal.classList.add('open');
  }
  function markMissionComplete(number){
    const num=Number(number),key=missionKey(state.grade,state.world,num); if(state.completed.has(key))return;
    state.completed.add(key);
    try{localStorage.setItem(storageKey(state.grade),JSON.stringify([...state.completed]));}catch(_){ }
    renderWorld(state.worldData);
    const complete=document.querySelector('[data-curriculum-complete]'); if(complete){complete.textContent='COMPLETED ✓';complete.disabled=true;}
    window.dispatchEvent(new CustomEvent('magicCurriculumMissionComplete',{detail:{grade:state.grade,world:state.world,mission:num,xpEarned:getConfig().xpPerMission,starsEarned:getConfig().starsPerMission,xpTotal:xpTotal(),starsTotal:starsTotal()}}));
  }
  function restoreProgress(){
    try{
      const current=JSON.parse(localStorage.getItem(storageKey(state.grade))||'null');
      if(Array.isArray(current)){current.forEach(key=>state.completed.add(String(key)));return;}
      const legacy=JSON.parse(localStorage.getItem('magicCurriculumCompleted')||'[]');
      if(Array.isArray(legacy))legacy.filter(key=>String(key).startsWith(`${state.grade}:`)).forEach(key=>state.completed.add(String(key)));
      if(state.completed.size)localStorage.setItem(storageKey(state.grade),JSON.stringify([...state.completed]));
    }catch(_){ }
  }

  async function loadWorld(grade,world){
    if(state.loading)return;
    if(!worldUnlocked(world)){renderProgress();const errorHost=document.querySelector('[data-curriculum-error]');if(errorHost){errorHost.hidden=false;errorHost.textContent=`WORLD ${world} ჩაკეტილია. ჯერ დაასრულე WORLD ${world-1} — ${getConfig().missionCount}/${getConfig().missionCount} მისია.`;}return;}
    state.loading=true;
    const loading=document.querySelector('[data-curriculum-loading]'),errorHost=document.querySelector('[data-curriculum-error]'); if(loading)loading.hidden=false; if(errorHost)errorHost.hidden=true;
    try{const data=await fetchWorld(grade,world);state.grade=grade;state.world=world;state.worldData=data;renderWorld(data);window.dispatchEvent(new CustomEvent('magicCurriculumWorldLoaded',{detail:{grade,world,data}}));}
    catch(error){console.error('[Magic Curriculum]',error);if(errorHost){errorHost.hidden=false;errorHost.textContent=error.message||'Curriculum ჩატვირთვა ვერ მოხერხდა.';}}
    finally{state.loading=false;if(loading)loading.hidden=true;}
  }
  function bindModal(){
    const modal=document.querySelector('[data-curriculum-modal]'); if(!modal)return; const close=()=>{modal.hidden=true;modal.classList.remove('open');};
    modal.querySelectorAll('[data-curriculum-close]').forEach(button=>button.addEventListener('click',close));
    const complete=modal.querySelector('[data-curriculum-complete]'); if(complete)complete.addEventListener('click',()=>markMissionComplete(complete.dataset.mission));
    modal.addEventListener('click',event=>{if(event.target===modal)close();}); document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  }
  async function boot(){
    const grade=getGrade(); if(!grade||grade<5)return; state.grade=grade; restoreProgress();
    window.MagicCurriculum={state,loadWorld,fetchWorld,openMission,markMissionComplete,worldUrl,worldUnlocked,xpTotal,starsTotal,completedTotal}; bindModal();
    const requestedWorld=Number(new URLSearchParams(window.location.search).get('world'))||1; await loadWorld(grade,Math.min(Math.max(requestedWorld,1),getConfig().worldCount));
  }
  boot();
})();