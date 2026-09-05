/* MAGIC NEON AI ACADEMY — LESSON CHAMBER 5.0 — visual-only */
(function(){'use strict';if(window.__EWM_CHAMBER5)return;window.__EWM_CHAMBER5=true;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var targets=['#modal','.g3-vocab-modal','.g4-vocab-modal'];
function visible(e){if(!e)return false;var s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&e.getBoundingClientRect().height>0}
function mount(m){if(!visible(m)||m.querySelector(':scope > .lc5-depth'))return;m.classList.add('lc5-active');var d=document.createElement('div');d.className='lc5-depth';d.setAttribute('aria-hidden','true');['n1','n2','n3','n4'].forEach(function(c){var e=document.createElement('i');e.className='lc5-node '+c;d.appendChild(e)});['l1','l2','l3','l4'].forEach(function(c){var e=document.createElement('i');e.className='lc5-link '+c;d.appendChild(e)});var ring=document.createElement('div');ring.className='lc5-ring';d.appendChild(ring);[['c1','MISSION CORE'],['c2','NEURAL LINK ONLINE'],['c3','MAGIC FIELD 5.0']].forEach(function(a){var e=document.createElement('div');e.className='lc5-holo-card '+a[0];e.textContent=a[1];d.appendChild(e)});m.appendChild(d);if(reduce)d.classList.add('lc5-static')}
function scan(){targets.forEach(function(s){document.querySelectorAll(s).forEach(mount)})}scan();new MutationObserver(scan).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','aria-hidden']});
})();
