/* English with Mariami — unified Magic Mission Navigator */
(function(){'use strict';
if(!/academy\.html$/i.test(location.pathname))return;
const grades=[2,3,4],total={2:60,3:60,4:60};
function readJson(k,d){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(_){return d}}
function local(g){const s=readJson(`magic-neon-grade-${g}`,{});return {done:new Set(Array.isArray(s.done)?s.done.map(Number):[]),current:Number(s.current)||1}}
function next(g){const s=local(g);for(let i=1;i<=total[g];i++)if(!s.done.has(i))return i;return total[g]}
function build(){const root=document.querySelector('.magic-command-center');if(!root)return;let box=root.querySelector('.magic-mission-navigator');if(!box){box=document.createElement('section');box.className='magic-mission-navigator';root.appendChild(box)}let g=4,m=next(4);for(const x of grades){const n=next(x);if(n<total[x]||x===4){g=x;m=n;break}}const s=local(g),done=Math.min(total[g],s.done.size),pct=Math.round(done/total[g]*100);box.innerHTML=`<div class="mmn-signal"><span></span><small>NEXT MISSION SIGNAL</small></div><div class="mmn-main"><div><small>ROUTE LOCKED</small><strong>GRADE ${g} • MISSION ${m}</strong><p>${done}/${total[g]} missions complete • ${pct}% grade route</p></div><a class="mmn-action" href="/grade${g}/?mission=${m}">⚡ LAUNCH MISSION</a></div><div class="mmn-route">${grades.map(x=>{const a=local(x),d=Math.min(total[x],a.done.size),active=x===g;return `<span class="${active?'active':''} ${d>=total[x]?'complete':''}"><b>G${x}</b><i style="width:${Math.round(d/total[x]*100)}%"></i></span>`}).join('')}</div>`}
function boot(){build();setInterval(build,5000);addEventListener('englishMariamiProgressUpdated',build)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();