/* MAGIC NEON AI ACADEMY — Lesson Mission HUD 2.0 (SVG, visual-only) */
(function(){'use strict';
if(window.__EWMLessonHUD2)return;window.__EWMLessonHUD2=true;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var selectors=['#modal','.g3-vocab-modal','.g4-vocab-modal'];
function visible(el){if(!el)return false;var s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getBoundingClientRect().height>0}
function grade(){var p=(location.pathname||'').toLowerCase();return p.includes('grade4')?'G4':p.includes('grade3')?'G3':p.includes('grade2')?'G2':'CORE'}
function mount(modal){if(!visible(modal)||modal.querySelector(':scope > .lesson-mission-hud2'))return;
 var hud=document.createElement('div');hud.className='lesson-mission-hud2';hud.setAttribute('aria-hidden','true');
 var img=document.createElement('img');img.src='/shared/lesson-mission-hud-2.svg?v=20260906-hud2';img.alt='';hud.appendChild(img);
 var badge=document.createElement('div');badge.className='lmh2-live';badge.textContent=grade()+' // LIVE';hud.appendChild(badge);
 modal.appendChild(hud);
 if(!reduce){hud.classList.add('lmh2-enter');setTimeout(function(){hud.classList.remove('lmh2-enter')},900)}
}
function scan(){selectors.forEach(function(s){document.querySelectorAll(s).forEach(mount)})}
scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','aria-hidden']});
})();
