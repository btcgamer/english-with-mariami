/* English with Mariami — Magic World Portal v4 */
(function(){'use strict';
if(!/academy\.html$/i.test(location.pathname))return;
const grades={2:{icon:'🌱',name:'GRADE 2',worlds:['My World','Family & Friends','Daily Routines','School Life','Food & Drinks','My Home','Clothes','Weather','Animals','Hobbies','My Day','Big Review']},3:{icon:'🔮',name:'GRADE 3',worlds:['My Identity','Family Stories','Daily Life','School Projects','Food & Health','My Home & Neighborhood','Clothes & Choices','Weather & Nature','Animal World','Hobbies & Skills','A Day to Remember','Big Review']},4:{icon:'👑',name:'GRADE 4',worlds:['Identity & Goals','Family & Relationships','Time & Productivity','Learning & Projects','Health & Choices','Community & Places','Style & Decisions','Climate & Environment','Animals & Science','Skills & Creativity','Experiences & Memories','Ideas & Opinions']}};
const worldIcons=['🌍','👨‍👩‍👧','⏰','🏫','🍎','🏠','👕','☁️','🦁','🎨','🌟','👑'];
function read(g){try{const s=JSON.parse(localStorage.getItem(`magic-neon-grade-${g}`)||'{}');return new Set(Array.isArray(s.done)?s.done.map(Number):[])}catch(_){return new Set()}}
function activeWorld(done){for(let i=1;i<=12;i++){const start=(i-1)*5+1;if(![0,1,2,3,4].every(k=>done.has(start+k)))return i}return 12}
function launch(link){
 if(window.__mwpLaunching)return;
 if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
 if(link.origin!==location.origin)return;
 if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){location.href=link.href;return}
 window.__mwpLaunching=true;link.dataset.launching='true';
 const worldNo=link.dataset.world||'01';
 const title=link.querySelector('.mwp-name')?.textContent||`WORLD ${worldNo}`;
 const overlay=document.createElement('div');overlay.className='mwp-launch';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','assertive');
 overlay.innerHTML=`<div class="mwp-launch-core"><span class="mwp-launch-ring"></span><span class="mwp-launch-ring r2"></span><span class="mwp-launch-beam"></span><span class="mwp-launch-orb">${worldIcons[Math.max(0,Number(worldNo)-1)]||'✦'}</span></div><small class="mwp-launch-label">PORTAL CHARGING • WORLD ${String(worldNo).padStart(2,'0')}</small><strong class="mwp-launch-title">${title}</strong><div class="mwp-launch-progress"><i></i></div><span class="mwp-launch-state">GATEWAY OPENING…</span>`;
 document.body.appendChild(overlay);document.body.classList.add('mwp-launching');
 let start=performance.now(),duration=760,raf=0;
 const tick=now=>{const p=Math.min(1,(now-start)/duration);overlay.style.setProperty('--mwp-launch-progress',`${Math.round(p*100)}%`);if(p<1)raf=requestAnimationFrame(tick);else location.href=link.href};
 raf=requestAnimationFrame(tick);
 const cleanup=()=>{if(raf)cancelAnimationFrame(raf);overlay.remove();document.body.classList.remove('mwp-launching');};
 addEventListener('pagehide',cleanup,{once:true});
}
function bindLaunch(){document.querySelectorAll('.mwp-portal').forEach(link=>{if(link.dataset.launchBound)return;link.dataset.launchBound='1';link.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();launch(link)})})}
function build(){const root=document.querySelector('.magic-command-center');if(!root)return;let box=root.querySelector('.magic-world-portals');if(!box){box=document.createElement('section');box.className='magic-world-portals';root.appendChild(box)}let activeGrade=4;for(const g of [2,3,4]){if(read(g).size<60){activeGrade=g;break}}const g=grades[activeGrade],done=read(activeGrade),world=activeWorld(done),completed=Math.min(60,done.size);box.dataset.grade=String(activeGrade);box.innerHTML=`<div class="mwp-head"><div><small>MAGIC WORLD PORTAL // GATEWAY ONLINE</small><strong>${g.name} • 12 WORLDS</strong></div><span>5 MISSIONS PER WORLD • ${completed}/60 COMPLETE</span></div><div class="mwp-grid">${g.worlds.map((name,i)=>{const worldNo=i+1,start=i*5+1,count=[0,1,2,3,4].filter(k=>done.has(start+k)).length,complete=count===5,active=worldNo===world&&!complete,pct=count*20;return `<a class="mwp-portal mwp-world-${worldNo} ${complete?'complete':''} ${active?'active':''}" data-world="${worldNo}" href="/grade${activeGrade}/?mission=${start}" aria-label="${g.name}, World ${worldNo}, ${name}, ${pct}% complete"><span class="mwp-portal-ring" aria-hidden="true"></span><span class="mwp-orb"><i>${complete?'✓':worldIcons[i]}</i></span><span class="mwp-world-code">WORLD ${String(worldNo).padStart(2,'0')}</span><b class="mwp-name">${name}</b><span class="mwp-meta"><span>${complete?'UNLOCKED':active?'NEXT PORTAL':'PORTAL'}</span><span>${count}/5</span></span><span class="mwp-bar"><i style="--mwp-progress:${pct}%"></i></span></a>`}).join('')}</div>`;bindLaunch()}
let timer=0;function boot(){build();timer=window.setInterval(()=>{if(!document.hidden&&!window.__mwpLaunching)build()},8000);addEventListener('englishMariamiProgressUpdated',build);addEventListener('visibilitychange',()=>{if(document.hidden&&timer){clearInterval(timer);timer=0}else if(!document.hidden&&!timer){timer=window.setInterval(()=>{if(!document.hidden&&!window.__mwpLaunching)build()},8000)}})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();