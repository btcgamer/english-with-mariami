/* MAGIC NEON AI ACADEMY — MAGIC WORLD OS 9.0 */
(function(){'use strict';if(window.__EWM_MAGIC_WORLD_OS9)return;window.__EWM_MAGIC_WORLD_OS9=true;
function visible(el){if(!el)return false;var s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}
function targets(){return Array.prototype.slice.call(document.querySelectorAll('#modal,.g3-vocab-modal,.g4-vocab-modal')).filter(visible)}
function mount(host){if(host.querySelector('.magic-world-os9'))return;var o=document.createElement('div');o.className='magic-world-os9';o.setAttribute('aria-hidden','true');o.innerHTML='<div class="mw9-stars"></div><div class="mw9-top"><div class="mw9-brand">✦ MAGIC WORLD // AI NEURAL SPACE</div><div class="mw9-status"><span class="mw9-dot"></span>CORE ONLINE</div></div><div class="mw9-radar"><i class="mw9-beam"></i><i class="mw9-beam"></i><i class="mw9-beam"></i><i class="mw9-beam"></i><i class="mw9-beam"></i></div><i class="mw9-corner tl"></i><i class="mw9-corner tr"></i><i class="mw9-corner bl"></i><i class="mw9-corner br"></i><div class="mw9-bottom"><i></i>NEURAL FIELD ACTIVE<span>◆</span>MAGIC SYSTEM ONLINE<span>◆</span>LESSON WORLD</div>';host.appendChild(o)}
function scan(){targets().forEach(mount)}
scan();var mo=new MutationObserver(scan);mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','hidden']});setInterval(scan,1200);
})();
