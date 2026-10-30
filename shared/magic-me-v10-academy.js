/* Magic Me V10: Show only locally stored, account-scoped avatar, never child photos. */
(()=>{'use strict';
 const c=window.MARIAMI_MAGIC_ME_CONTEXT;
 if(!c?.userId||c.isOwner)return; // Site owner's Mariami portrait remains unchanged.
 let data=null;
 try{const s=localStorage.getItem('ewm-magic-me-v10:'+c.userId);if(s)data=JSON.parse(s)}catch{}
 if(!data||typeof data!=='object')return;
 const hero=document.querySelector('#ewm-progress .pg-hero');if(!hero)return;
 const old=hero.querySelector('.magic-me-card');if(old)old.style.display='none';
 const oldEditor=document.querySelector('.magic-me-editor');if(oldEditor)oldEditor.hidden=true;
 const card=document.createElement('section');card.className='magic-v10-card';card.setAttribute('aria-label','ჩემი პირადი მოძრავი პერსონაჟი');
 const frame=document.createElement('iframe');frame.className='magic-v10-frame';frame.src='magic-me-avatar-view.html?v=20261028';frame.title='ჩემი მოძრავი გმირი';frame.setAttribute('loading','eager');
 const txt=document.createElement('strong');txt.textContent='✨ ჩემი Magic Me გმირი';
 const buttons=document.createElement('div');buttons.className='magic-v10-actions';
 const dance=document.createElement('button');dance.type='button';dance.textContent='💃 აცეკვე';
 const wave=document.createElement('button');wave.type='button';wave.textContent='👋 ხელი';
 const edit=document.createElement('button');edit.type='button';edit.textContent='🎨 შეცვლა';
 buttons.append(dance,wave,edit);card.append(frame,txt,buttons);hero.prepend(card);
 const send=action=>{if(frame.contentWindow)frame.contentWindow.postMessage({type:'ewm-v10-parent',action,avatar:action==='display'?data:null},location.origin)};
 frame.addEventListener('load',()=>send('display'));
 dance.addEventListener('click',()=>send('dance'));wave.addEventListener('click',()=>send('wave'));
 edit.addEventListener('click',()=>location.assign('magic-me-register.html?mode=edit'));
 const style=document.createElement('style');style.textContent=`
  .magic-v10-card{position:relative;z-index:5;display:grid;justify-items:center;gap:8px;flex:0 0 205px;max-width:220px;padding:10px;border:1px solid #70dffa;border-radius:18px;background:linear-gradient(145deg,#13235a,#082c55);color:#e9fcff;text-align:center}
  .magic-v10-frame{display:block;width:180px;max-width:100%;height:275px;border:0;border-radius:14px;background:#092341}
  .magic-v10-card strong{font-size:13px}.magic-v10-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:5px}
  .magic-v10-actions button{background:#175282;color:#fff;border:1px solid #92dfff;border-radius:9px;padding:8px;font-size:11px;min-height:38px}
  @media(max-width:760px){html.magic-me-student #ewm-progress .pg-hero>.magic-v10-card{width:177px;flex:none!important;max-width:62vw}.magic-v10-frame{width:155px;height:250px}}
  @media(prefers-reduced-motion:reduce){.magic-v10-frame{scroll-behavior:auto}}
 `;document.head.appendChild(style);
})();
